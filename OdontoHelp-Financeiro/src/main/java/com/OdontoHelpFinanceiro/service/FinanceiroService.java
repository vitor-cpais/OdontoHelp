package com.OdontoHelpFinanceiro.service;

import com.OdontoHelpFinanceiro.domain.*;
import com.OdontoHelpFinanceiro.domain.enums.*;
import com.OdontoHelpFinanceiro.dto.DtoRecords.*;
import com.OdontoHelpFinanceiro.dto.ResponseRecords.*;
import com.OdontoHelpFinanceiro.infra.exception.BusinessException;
import com.OdontoHelpFinanceiro.infra.exception.ConflictException;
import com.OdontoHelpFinanceiro.infra.exception.NotFoundException;
import com.OdontoHelpFinanceiro.infra.security.AuthUser;
import com.OdontoHelpFinanceiro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final ClienteFinanceiroRepository clienteRepo;
    private final CobrancaRepository cobrancaRepo;
    private final ParcelaReceberRepository parcelaRepo;
    private final PagamentoRepository pagamentoRepo;
    private final MovimentoFinanceiroRepository movimentoRepo;
    private final RecorrenciaCobrancaRepository recorrenciaRepo;
    private final PreNfseRepository preNfseRepo;
    private final IdempotenciaCobrancaRepository idempotenciaRepo;
    private final IdempotenciaPagamentoRepository idempotenciaPagamentoRepo;
    private final EnvioLembreteCobrancaRepository envioLembreteRepo;
    private final CoreApiClient coreApiClient;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CobrancaResponse criarCobranca(CriarCobrancaRequest req, AuthUser user, String bearerToken) {
        if (req.idempotencyKey() != null && !req.idempotencyKey().isBlank()) {
            var existente = idempotenciaRepo.findByChave(req.idempotencyKey());
            if (existente.isPresent() && existente.get().getCobrancaId() != null) {
                return buscarCobranca(existente.get().getCobrancaId());
            }
        }

        var snapshot = coreApiClient.buscarPaciente(req.pacienteId(), bearerToken);
        var cliente = upsertCliente(snapshot);

        if (req.origemTipo() != null && req.origemIdExterno() != null) {
            cobrancaRepo.findByOrigemTipoAndOrigemIdExterno(req.origemTipo(), req.origemIdExterno())
                    .ifPresent(c -> { throw new ConflictException("Ja existe cobranca para esta origem"); });
        }

        BigDecimal desconto = nz(req.valorDesconto());
        BigDecimal acrescimo = nz(req.valorAcrescimo());
        BigDecimal valorTotal = req.valorBruto().subtract(desconto).add(acrescimo).setScale(2, RoundingMode.HALF_UP);
        if (valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor total deve ser positivo");
        }

        int qtdParcelas = req.quantidadeParcelas() != null ? req.quantidadeParcelas() : 1;
        LocalDate primeiroVenc = req.primeiroVencimento() != null ? req.primeiroVencimento() : LocalDate.now().plusDays(7);

        var cobranca = new Cobranca();
        cobranca.setCliente(cliente);
        cobranca.setOrigemTipo(req.origemTipo() != null ? req.origemTipo() : OrigemCobranca.MANUAL);
        cobranca.setOrigemIdExterno(req.origemIdExterno());
        cobranca.setDescricao(req.descricao());
        cobranca.setValorBruto(req.valorBruto());
        cobranca.setValorDesconto(desconto);
        cobranca.setValorAcrescimo(acrescimo);
        cobranca.setValorTotal(valorTotal);
        cobranca.setSaldoTotal(valorTotal);
        cobranca.setQuantidadeParcelas(qtdParcelas);
        cobranca.setDataEmissao(LocalDate.now());
        cobranca.setStatus(StatusFinanceiro.ABERTA);
        cobranca.setObservacao(req.observacao());
        cobranca.setCriadoPorUsuarioId(user.getUsuarioId());

        List<ParcelaReceber> parcelas = gerarParcelas(cobranca, valorTotal, qtdParcelas, primeiroVenc, req.parcelasCustomizadas());
        cobranca.getParcelas().addAll(parcelas);
        cobranca = cobrancaRepo.save(cobranca);

        registrarMovimento(cobranca, null, null, TipoMovimento.CRIACAO_COBRANCA, valorTotal,
                "Cobranca criada", user.getUsuarioId());

        if (req.idempotencyKey() != null && !req.idempotencyKey().isBlank()) {
            var idem = new IdempotenciaCobranca();
            idem.setChave(req.idempotencyKey());
            idem.setCobrancaId(cobranca.getId());
            idempotenciaRepo.save(idem);
        }

        return toCobrancaResponse(cobranca, parcelaRepo.findByCobrancaIdOrderByNumeroAsc(cobranca.getId()));
    }

    @Transactional
    public CobrancaResponse gerarCobrancaAtendimento(GerarCobrancaAtendimentoRequest req, AuthUser user, String bearerToken) {
        BigDecimal total = req.itens().stream()
                .map(ItemAtendimentoCobravelDTO::valorCobradoSnapshot)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var criar = new CriarCobrancaRequest(
                req.pacienteId(), req.descricao(), total, nz(req.valorDesconto()), nz(req.valorAcrescimo()),
                req.quantidadeParcelas() != null ? req.quantidadeParcelas() : 1,
                req.primeiroVencimento(), OrigemCobranca.ATENDIMENTO,
                String.valueOf(req.atendimentoId()), null, null, req.idempotencyKey());

        var response = criarCobranca(criar, user, bearerToken);

        for (var item : req.itens()) {
            coreApiClient.marcarItemCobrado(item.itemAtendimentoId(), response.id(), bearerToken);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public CobrancaResponse buscarCobranca(Long id) {
        var cobranca = cobrancaRepo.findById(id).orElseThrow(() -> new NotFoundException("Cobranca nao encontrada"));
        return toCobrancaResponse(cobranca, parcelaRepo.findByCobrancaIdOrderByNumeroAsc(id));
    }

    @Transactional(readOnly = true)
    public Page<CobrancaResponse> listarCobrancas(
            Long pacienteId, StatusFinanceiro status, OrigemCobranca origemTipo,
            LocalDate dataEmissaoDe, LocalDate dataEmissaoAte, Pageable pageable) {
        var page = cobrancaRepo.filtrar(pacienteId, status, origemTipo, dataEmissaoDe, dataEmissaoAte, pageable);
        var cobrancaIds = page.getContent().stream().map(Cobranca::getId).toList();
        var recorrenciasPorCobranca = recorrenciaRepo.findByCobrancaIdIn(cobrancaIds).stream()
                .collect(java.util.stream.Collectors.toMap(r -> r.getCobranca().getId(), r -> r, (a, b) -> a));
        return page.map(c -> CobrancaResponse.from(
                c,
                parcelaRepo.findByCobrancaIdOrderByNumeroAsc(c.getId()),
                recorrenciasPorCobranca.get(c.getId())));
    }

    @Transactional
    public CobrancaResponse cancelarCobranca(Long id, AuthUser user) {
        var cobranca = cobrancaRepo.findById(id).orElseThrow(() -> new NotFoundException("Cobranca nao encontrada"));
        if (cobranca.getStatus() == StatusFinanceiro.PAGA) {
            throw new BusinessException("Cobranca ja paga nao pode ser cancelada");
        }
        if (cobranca.getValorPago().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cobranca com pagamentos deve ser estornada antes de cancelar");
        }
        cobranca.setStatus(StatusFinanceiro.CANCELADA);
        cobranca.setSaldoTotal(BigDecimal.ZERO);
        cobranca.touch();
        for (var p : parcelaRepo.findByCobrancaIdOrderByNumeroAsc(id)) {
            if (p.getStatus() != StatusFinanceiro.PAGA) {
                p.setStatus(StatusFinanceiro.CANCELADA);
                p.setSaldo(BigDecimal.ZERO);
                p.touch();
            }
        }
        registrarMovimento(cobranca, null, null, TipoMovimento.CANCELAMENTO, cobranca.getValorTotal(),
                "Cobranca cancelada", user.getUsuarioId());
        return buscarCobranca(id);
    }

    @Transactional
    public PagamentoResponse registrarPagamento(Long parcelaId, RegistrarPagamentoRequest req, AuthUser user,
                                                String idempotencyKey, String bearerToken) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var existente = idempotenciaPagamentoRepo.findByChave(idempotencyKey.trim());
            if (existente.isPresent() && existente.get().getPagamentoId() != null) {
                var pg = pagamentoRepo.findById(existente.get().getPagamentoId())
                        .orElseThrow(() -> new NotFoundException("Pagamento nao encontrado"));
                return PagamentoResponse.from(pg);
            }
        }

        var parcela = parcelaRepo.findById(parcelaId).orElseThrow(() -> new NotFoundException("Parcela nao encontrada"));
        if (parcela.getStatus() == StatusFinanceiro.PAGA || parcela.getStatus() == StatusFinanceiro.CANCELADA) {
            throw new BusinessException("Parcela nao aceita pagamento");
        }
        if (req.valor().compareTo(parcela.getSaldo()) > 0) {
            throw new BusinessException("Valor excede saldo da parcela");
        }

        var pagamento = new Pagamento();
        pagamento.setParcela(parcela);
        pagamento.setValor(req.valor());
        pagamento.setDataPagamento(req.dataPagamento());
        pagamento.setFormaPagamento(req.formaPagamento());
        pagamento.setReferenciaExterna(req.referenciaExterna());
        pagamento.setObservacao(req.observacao());
        pagamento.setRegistradoPorUsuarioId(user.getUsuarioId());
        pagamento = pagamentoRepo.save(pagamento);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var idem = new IdempotenciaPagamento();
            idem.setChave(idempotencyKey.trim());
            idem.setPagamentoId(pagamento.getId());
            idempotenciaPagamentoRepo.save(idem);
        }

        parcela.setValorPago(parcela.getValorPago().add(req.valor()));
        parcela.setSaldo(parcela.getValorTotal().subtract(parcela.getValorPago()));
        atualizarStatusParcela(parcela);
        parcela.touch();

        var cobranca = parcela.getCobranca();
        cobranca.setValorPago(cobranca.getValorPago().add(req.valor()));
        cobranca.setSaldoTotal(cobranca.getValorTotal().subtract(cobranca.getValorPago()));
        atualizarStatusCobranca(cobranca);
        cobranca.touch();

        registrarMovimento(cobranca, parcela, pagamento, TipoMovimento.BAIXA, req.valor(),
                "Pagamento registrado", user.getUsuarioId());

        eventPublisher.publishEvent(new PagamentoConfirmadoEvent(pagamento.getId(), bearerToken));

        return PagamentoResponse.from(pagamento);
    }

    @Transactional
    public PagamentoResponse estornarPagamento(Long pagamentoId, AuthUser user) {
        var pagamento = pagamentoRepo.findById(pagamentoId).orElseThrow(() -> new NotFoundException("Pagamento nao encontrado"));
        if (pagamento.getStatus() == StatusPagamento.ESTORNADO) {
            throw new BusinessException("Pagamento ja estornado");
        }
        pagamento.setStatus(StatusPagamento.ESTORNADO);
        var parcela = pagamento.getParcela();
        parcela.setValorPago(parcela.getValorPago().subtract(pagamento.getValor()));
        parcela.setSaldo(parcela.getValorTotal().subtract(parcela.getValorPago()));
        parcela.setDataPagamentoTotal(null);
        atualizarStatusParcela(parcela);
        parcela.touch();

        var cobranca = parcela.getCobranca();
        cobranca.setValorPago(cobranca.getValorPago().subtract(pagamento.getValor()));
        cobranca.setSaldoTotal(cobranca.getValorTotal().subtract(cobranca.getValorPago()));
        atualizarStatusCobranca(cobranca);
        cobranca.touch();

        registrarMovimento(cobranca, parcela, pagamento, TipoMovimento.ESTORNO, pagamento.getValor(),
                "Estorno de pagamento", user.getUsuarioId());
        return PagamentoResponse.from(pagamento);
    }

    @Transactional
    public ParcelaResponse ajustarParcela(Long parcelaId, AjustarParcelaRequest req, AuthUser user) {
        var parcela = parcelaRepo.findById(parcelaId).orElseThrow(() -> new NotFoundException("Parcela nao encontrada"));
        if (parcela.getStatus() == StatusFinanceiro.PAGA || parcela.getStatus() == StatusFinanceiro.CANCELADA) {
            throw new BusinessException("Parcela nao pode ser ajustada");
        }
        BigDecimal desconto = req.valorDesconto() != null ? req.valorDesconto() : parcela.getValorDesconto();
        BigDecimal acrescimo = req.valorAcrescimo() != null ? req.valorAcrescimo() : parcela.getValorAcrescimo();
        parcela.setValorDesconto(desconto);
        parcela.setValorAcrescimo(acrescimo);
        parcela.setValorTotal(parcela.getValorOriginal().subtract(desconto).add(acrescimo));
        parcela.setSaldo(parcela.getValorTotal().subtract(parcela.getValorPago()));
        if (req.observacao() != null) parcela.setObservacao(req.observacao());
        atualizarStatusParcela(parcela);
        parcela.touch();
        recalcularCobranca(parcela.getCobranca());
        registrarMovimento(parcela.getCobranca(), parcela, null, TipoMovimento.AJUSTE, parcela.getValorTotal(),
                "Ajuste de parcela", user.getUsuarioId());
        return ParcelaResponse.from(parcela);
    }

    @Transactional
    public ParcelaResponse alterarVencimento(Long parcelaId, AlterarVencimentoRequest req) {
        var parcela = parcelaRepo.findById(parcelaId).orElseThrow(() -> new NotFoundException("Parcela nao encontrada"));
        if (parcela.getStatus() == StatusFinanceiro.PAGA || parcela.getStatus() == StatusFinanceiro.CANCELADA) {
            throw new BusinessException("Parcela nao pode ter vencimento alterado");
        }
        parcela.setDataVencimento(req.dataVencimento());
        atualizarStatusParcela(parcela);
        parcela.touch();
        return ParcelaResponse.from(parcela);
    }

    @Transactional
    public ParcelaResponse perdoarParcela(Long parcelaId, PerdoarParcelaRequest req, AuthUser user) {
        var parcela = parcelaRepo.findById(parcelaId).orElseThrow(() -> new NotFoundException("Parcela nao encontrada"));
        if (parcela.getStatus() == StatusFinanceiro.PAGA || parcela.getStatus() == StatusFinanceiro.CANCELADA) {
            throw new BusinessException("Parcela nao pode ser perdoada");
        }
        if (parcela.getSaldo().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Parcela sem saldo em aberto");
        }

        BigDecimal valorPerdoado = parcela.getSaldo();
        parcela.setValorTotal(parcela.getValorPago());
        parcela.setSaldo(BigDecimal.ZERO);
        parcela.setStatus(StatusFinanceiro.CANCELADA);
        String motivo = req.observacao() != null && !req.observacao().isBlank()
                ? req.observacao().trim()
                : null;
        String anotacao = motivo != null ? "Perdao: " + motivo : "Divida perdoada";
        parcela.setObservacao(concatObservacao(parcela.getObservacao(), anotacao));
        parcela.touch();

        var cobranca = parcela.getCobranca();
        recalcularCobranca(cobranca);
        registrarMovimento(cobranca, parcela, null, TipoMovimento.CANCELAMENTO, valorPerdoado,
                anotacao, user.getUsuarioId());
        return ParcelaResponse.from(parcela);
    }

    private static String concatObservacao(String atual, String nova) {
        if (atual == null || atual.isBlank()) {
            return nova;
        }
        return atual.trim() + " | " + nova;
    }

    @Transactional(readOnly = true)
    public Page<ParcelaResponse> listarParcelas(StatusFinanceiro status, Pageable pageable) {
        Page<ParcelaReceber> page = status != null
                ? parcelaRepo.findByStatus(status, pageable)
                : parcelaRepo.findAll(pageable);
        return page.map(ParcelaResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ParcelaResponse> listarInadimplencia(
            Long pacienteId, LocalDate vencimentoDe, LocalDate vencimentoAte, Pageable pageable) {
        atualizarParcelasVencidas();
        LocalDate hoje = LocalDate.now();
        return parcelaRepo.findInadimplentesFiltrados(hoje, pacienteId, vencimentoDe, vencimentoAte, pageable)
                .map(ParcelaResponse::from);
    }

    @Transactional(readOnly = true)
    public PosicaoFinanceiraResponse posicaoPaciente(Long pacienteId) {
        atualizarParcelasVencidas();
        var parcelas = parcelaRepo.findByPacienteId(pacienteId);
        BigDecimal aberto = BigDecimal.ZERO;
        BigDecimal vencido = BigDecimal.ZERO;
        BigDecimal pago = BigDecimal.ZERO;
        for (var p : parcelas) {
            pago = pago.add(p.getValorPago());
            if (p.getStatus() == StatusFinanceiro.VENCIDA) vencido = vencido.add(p.getSaldo());
            else if (p.getStatus() == StatusFinanceiro.ABERTA || p.getStatus() == StatusFinanceiro.PARCIALMENTE_PAGA) {
                aberto = aberto.add(p.getSaldo());
            }
        }
        return new PosicaoFinanceiraResponse(
                pacienteId, aberto, vencido, pago,
                parcelas.stream().map(ParcelaResponse::from).toList());
    }

    @Transactional(readOnly = true)
    public RecorrenciaResponse buscarRecorrenciaPorCobranca(Long cobrancaId) {
        if (!cobrancaRepo.existsById(cobrancaId)) {
            throw new NotFoundException("Cobranca nao encontrada");
        }
        return recorrenciaRepo.findByCobrancaId(cobrancaId)
                .map(RecorrenciaResponse::from)
                .orElseThrow(() -> new NotFoundException("Recorrencia nao encontrada"));
    }

    @Transactional
    public RecorrenciaResponse criarRecorrencia(Long cobrancaId, CriarRecorrenciaRequest req) {
        var cobranca = cobrancaRepo.findById(cobrancaId).orElseThrow(() -> new NotFoundException("Cobranca nao encontrada"));
        recorrenciaRepo.findByCobrancaId(cobrancaId).ifPresent(r -> {
            throw new ConflictException("Cobranca ja possui recorrencia");
        });
        var rec = new RecorrenciaCobranca();
        rec.setCobranca(cobranca);
        rec.setDiaVencimento(req.diaVencimento());
        rec.setValorBase(req.valorBase());
        rec.setDataInicio(req.dataInicio());
        rec.setDataFim(req.dataFim());
        rec.setProximaGeracao(req.dataInicio());
        rec.setObservacao(req.observacao());
        cobranca.setOrigemTipo(OrigemCobranca.RECORRENCIA);
        return RecorrenciaResponse.from(recorrenciaRepo.save(rec));
    }

    @Transactional
    public RecorrenciaResponse pausarRecorrencia(Long id) {
        var rec = recorrenciaRepo.findById(id).orElseThrow(() -> new NotFoundException("Recorrencia nao encontrada"));
        if (rec.getDataFim() != null) {
            throw new BusinessException("Recorrencia encerrada nao pode ser pausada");
        }
        if (!Boolean.TRUE.equals(rec.getAtiva())) {
            return RecorrenciaResponse.from(rec);
        }
        rec.setAtiva(false);
        rec.touch();
        return RecorrenciaResponse.from(recorrenciaRepo.save(rec));
    }

    @Transactional
    public RecorrenciaResponse reativarRecorrencia(Long id) {
        var rec = recorrenciaRepo.findById(id).orElseThrow(() -> new NotFoundException("Recorrencia nao encontrada"));
        if (rec.getDataFim() != null) {
            throw new BusinessException("Recorrencia encerrada nao pode ser reativada");
        }
        if (Boolean.TRUE.equals(rec.getAtiva())) {
            return RecorrenciaResponse.from(rec);
        }
        rec.setAtiva(true);
        rec.touch();
        return RecorrenciaResponse.from(recorrenciaRepo.save(rec));
    }

    @Transactional
    public RecorrenciaResponse encerrarRecorrencia(Long id) {
        var rec = recorrenciaRepo.findById(id).orElseThrow(() -> new NotFoundException("Recorrencia nao encontrada"));
        if (rec.getDataFim() != null) {
            return RecorrenciaResponse.from(rec);
        }
        rec.setAtiva(false);
        rec.setDataFim(LocalDate.now());
        rec.touch();
        return RecorrenciaResponse.from(recorrenciaRepo.save(rec));
    }

    @Transactional
    public RecorrenciaResponse atualizarRecorrencia(Long id, AtualizarRecorrenciaRequest req) {
        var rec = recorrenciaRepo.findById(id).orElseThrow(() -> new NotFoundException("Recorrencia nao encontrada"));
        if (rec.getDataFim() != null) {
            throw new BusinessException("Recorrencia encerrada nao pode ser alterada");
        }
        if (req.diaVencimento() != null) {
            rec.setDiaVencimento(req.diaVencimento());
        }
        if (req.valorBase() != null) {
            rec.setValorBase(req.valorBase());
        }
        if (req.dataFim() != null) {
            rec.setDataFim(req.dataFim());
        }
        if (req.proximaGeracao() != null) {
            rec.setProximaGeracao(req.proximaGeracao());
        }
        if (req.observacao() != null) {
            rec.setObservacao(req.observacao().isBlank() ? null : req.observacao().trim());
        }
        rec.touch();
        return RecorrenciaResponse.from(recorrenciaRepo.save(rec));
    }

    @Transactional
    public int gerarParcelasRecorrencia() {
        int geradas = 0;
        var recorrencias = recorrenciaRepo.findByAtivaTrueAndProximaGeracaoLessThanEqual(LocalDate.now());
        for (var rec : recorrencias) {
            if (rec.getDataFim() != null && rec.getDataFim().isBefore(LocalDate.now())) {
                rec.setAtiva(false);
                continue;
            }
            var cobranca = rec.getCobranca();
            int proximoNumero = cobranca.getQuantidadeParcelas() + 1;
            var parcela = new ParcelaReceber();
            parcela.setCobranca(cobranca);
            parcela.setNumero(proximoNumero);
            parcela.setValorOriginal(rec.getValorBase());
            parcela.setValorTotal(rec.getValorBase());
            parcela.setSaldo(rec.getValorBase());
            parcela.setDataVencimento(rec.getProximaGeracao());
            parcela.setStatus(StatusFinanceiro.ABERTA);
            parcelaRepo.save(parcela);

            cobranca.setQuantidadeParcelas(proximoNumero);
            cobranca.setValorBruto(cobranca.getValorBruto().add(rec.getValorBase()));
            cobranca.setValorTotal(cobranca.getValorTotal().add(rec.getValorBase()));
            cobranca.setSaldoTotal(cobranca.getSaldoTotal().add(rec.getValorBase()));
            cobranca.setStatus(StatusFinanceiro.ABERTA);
            cobranca.touch();

            rec.setProximaGeracao(rec.getProximaGeracao().plusMonths(1));
            rec.touch();
            geradas++;
        }
        return geradas;
    }

    @Transactional(readOnly = true)
    public DashboardResumoResponse dashboardResumo() {
        atualizarParcelasVencidas();
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        BigDecimal recebido = pagamentoRepo.somarRecebidoNoPeriodo(
                inicioMes, hoje, StatusPagamento.CONFIRMADO);
        var inadimplentes = parcelaRepo.findInadimplentes(hoje, Pageable.unpaged());
        return new DashboardResumoResponse(
                parcelaRepo.somarSaldoTotalAberto(),
                parcelaRepo.somarSaldoInadimplente(hoje),
                recebido,
                parcelaRepo.somarPrevisaoRecebimento(hoje),
                inadimplentes.getTotalElements());
    }

    @Transactional
    public void enviarLembreteEmail(Long parcelaId, AuthUser user, String bearerToken) {
        var parcela = parcelaRepo.findById(parcelaId).orElseThrow(() -> new NotFoundException("Parcela nao encontrada"));
        var cliente = parcela.getCobranca().getCliente();
        if (cliente.getEmail() == null || cliente.getEmail().isBlank()) {
            throw new BusinessException("Paciente sem e-mail cadastrado");
        }
        var since = LocalDateTime.now().minusHours(24);
        if (envioLembreteRepo.countByParcelaIdAndCanalAndCriadoEmAfter(parcelaId, "EMAIL", since) > 0) {
            throw new BusinessException("Lembrete por e-mail ja enviado nas ultimas 24 horas");
        }
        var req = new LembreteCobrancaEmailRequest(
                cliente.getEmail(), cliente.getNome(), parcela.getSaldo(),
                parcela.getDataVencimento(), parcela.getCobranca().getDescricao(), parcelaId);
        coreApiClient.enviarLembreteCobranca(req, bearerToken);
        var log = new EnvioLembreteCobranca();
        log.setParcelaId(parcelaId);
        log.setCanal("EMAIL");
        log.setDestino(cliente.getEmail());
        log.setUsuarioId(user.getUsuarioId());
        envioLembreteRepo.save(log);
    }

    @Transactional
    public PreNfseResponse criarPreNfse(Long cobrancaId, CriarPreNfseRequest req) {
        var cobranca = cobrancaRepo.findById(cobrancaId).orElseThrow(() -> new NotFoundException("Cobranca nao encontrada"));
        validarCobrancaElegivelPreNfse(cobranca);
        var pre = new PreNfse();
        pre.setCobranca(cobranca);
        pre.setCliente(cobranca.getCliente());
        pre.setDescricaoServico(req.descricaoServico());
        pre.setValorServico(req.valorServico());
        pre.setCodigoServico(req.codigoServico());
        pre.setAliquotaIss(req.aliquotaIss());
        pre.setStatus(StatusPreNfse.PENDENTE);
        return PreNfseResponse.from(preNfseRepo.save(pre));
    }

    @Transactional
    public PreNfseResponse validarPreNfse(Long id) {
        var pre = preNfseRepo.findById(id).orElseThrow(() -> new NotFoundException("Pre-NFS-e nao encontrada"));
        if (pre.getValorServico() == null || pre.getDescricaoServico().isBlank()) {
            pre.setStatus(StatusPreNfse.ERRO_VALIDACAO);
        } else {
            pre.setStatus(StatusPreNfse.PRONTA_PARA_EMISSAO);
        }
        pre.touch();
        return PreNfseResponse.from(pre);
    }

    @Transactional
    public PreNfseResponse marcarEmitidaManualmente(Long id, MarcarPreNfseEmitidaRequest req) {
        var pre = preNfseRepo.findById(id).orElseThrow(() -> new NotFoundException("Pre-NFS-e nao encontrada"));
        pre.setStatus(StatusPreNfse.EMITIDA_MANUALMENTE);
        pre.setNumeroNfse(req.numeroNfse().trim());
        pre.setEmitidaEm(LocalDateTime.now());
        pre.touch();
        return PreNfseResponse.from(pre);
    }

    @Transactional(readOnly = true)
    public Page<PreNfseResponse> listarPreNfse(StatusPreNfse status, Pageable pageable) {
        Page<PreNfse> page = status != null ? preNfseRepo.findByStatus(status, pageable) : preNfseRepo.findAll(pageable);
        return page.map(PreNfseResponse::from);
    }

    private ClienteFinanceiro upsertCliente(ClienteSnapshotDTO snapshot) {
        return clienteRepo.findByPacienteIdExterno(snapshot.pacienteId())
                .map(c -> {
                    c.setNome(snapshot.nome());
                    c.setCpf(snapshot.cpf());
                    c.setEmail(snapshot.email());
                    c.setTelefone(snapshot.telefone());
                    c.setAtivo(snapshot.ativo());
                    c.touch();
                    return clienteRepo.save(c);
                })
                .orElseGet(() -> {
                    var c = new ClienteFinanceiro();
                    c.setPacienteIdExterno(snapshot.pacienteId());
                    c.setNome(snapshot.nome());
                    c.setCpf(snapshot.cpf());
                    c.setEmail(snapshot.email());
                    c.setTelefone(snapshot.telefone());
                    c.setAtivo(snapshot.ativo() != null ? snapshot.ativo() : true);
                    return clienteRepo.save(c);
                });
    }

    private List<ParcelaReceber> gerarParcelas(Cobranca cobranca, BigDecimal valorTotal, int qtd,
                                                LocalDate primeiroVenc, List<ParcelaInputDTO> custom) {
        List<ParcelaReceber> parcelas = new ArrayList<>();
        if (custom != null && !custom.isEmpty()) {
            int n = 1;
            for (var p : custom) {
                parcelas.add(novaParcela(cobranca, n++, p.valor(), p.dataVencimento()));
            }
            return parcelas;
        }
        BigDecimal valorParcela = valorTotal.divide(BigDecimal.valueOf(qtd), 2, RoundingMode.HALF_UP);
        BigDecimal acumulado = BigDecimal.ZERO;
        for (int i = 1; i <= qtd; i++) {
            BigDecimal valor = (i == qtd) ? valorTotal.subtract(acumulado) : valorParcela;
            acumulado = acumulado.add(valor);
            parcelas.add(novaParcela(cobranca, i, valor, primeiroVenc.plusMonths(i - 1)));
        }
        return parcelas;
    }

    private ParcelaReceber novaParcela(Cobranca cobranca, int numero, BigDecimal valor, LocalDate vencimento) {
        var p = new ParcelaReceber();
        p.setCobranca(cobranca);
        p.setNumero(numero);
        p.setValorOriginal(valor);
        p.setValorTotal(valor);
        p.setSaldo(valor);
        p.setDataVencimento(vencimento);
        p.setStatus(StatusFinanceiro.ABERTA);
        return p;
    }

    private void atualizarStatusParcela(ParcelaReceber p) {
        if (p.getStatus() == StatusFinanceiro.CANCELADA) return;
        if (p.getSaldo().compareTo(BigDecimal.ZERO) <= 0) {
            p.setStatus(StatusFinanceiro.PAGA);
            p.setDataPagamentoTotal(LocalDate.now());
        } else if (p.getDataVencimento().isBefore(LocalDate.now())) {
            p.setStatus(StatusFinanceiro.VENCIDA);
        } else if (p.getValorPago().compareTo(BigDecimal.ZERO) > 0) {
            p.setStatus(StatusFinanceiro.PARCIALMENTE_PAGA);
        } else {
            p.setStatus(StatusFinanceiro.ABERTA);
        }
    }

    private CobrancaResponse toCobrancaResponse(Cobranca cobranca, java.util.List<ParcelaReceber> parcelas) {
        var rec = recorrenciaRepo.findByCobrancaId(cobranca.getId()).orElse(null);
        return CobrancaResponse.from(cobranca, parcelas, rec);
    }

    private void atualizarStatusCobranca(Cobranca c) {
        if (c.getStatus() == StatusFinanceiro.CANCELADA) return;
        if (c.getSaldoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            c.setStatus(StatusFinanceiro.PAGA);
        } else {
            var parcelas = parcelaRepo.findByCobrancaIdOrderByNumeroAsc(c.getId());
            boolean vencida = parcelas.stream().anyMatch(p -> p.getStatus() == StatusFinanceiro.VENCIDA);
            if (vencida) {
                c.setStatus(StatusFinanceiro.VENCIDA);
            } else if (c.getValorPago().compareTo(BigDecimal.ZERO) > 0) {
                c.setStatus(StatusFinanceiro.PARCIALMENTE_PAGA);
            } else {
                c.setStatus(StatusFinanceiro.ABERTA);
            }
        }
    }

    private void recalcularCobranca(Cobranca c) {
        var parcelas = parcelaRepo.findByCobrancaIdOrderByNumeroAsc(c.getId());
        BigDecimal total = parcelas.stream().map(ParcelaReceber::getValorTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pago = parcelas.stream().map(ParcelaReceber::getValorPago).reduce(BigDecimal.ZERO, BigDecimal::add);
        c.setValorTotal(total);
        c.setValorPago(pago);
        c.setSaldoTotal(total.subtract(pago));
        atualizarStatusCobranca(c);
        c.touch();
    }

    private void atualizarParcelasVencidas() {
        var abertas = parcelaRepo.findAll().stream()
                .filter(p -> p.getSaldo().compareTo(BigDecimal.ZERO) > 0)
                .filter(p -> p.getStatus() != StatusFinanceiro.PAGA && p.getStatus() != StatusFinanceiro.CANCELADA)
                .filter(p -> p.getDataVencimento().isBefore(LocalDate.now()))
                .toList();
        for (var p : abertas) {
            p.setStatus(StatusFinanceiro.VENCIDA);
            p.touch();
            atualizarStatusCobranca(p.getCobranca());
        }
    }

    private void registrarMovimento(Cobranca c, ParcelaReceber p, Pagamento pg, TipoMovimento tipo,
                                  BigDecimal valor, String desc, Long usuarioId) {
        var m = new MovimentoFinanceiro();
        m.setCobranca(c);
        m.setParcela(p);
        m.setPagamento(pg);
        m.setTipo(tipo);
        m.setValor(valor);
        m.setDescricao(desc);
        m.setUsuarioId(usuarioId);
        movimentoRepo.save(m);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private void validarCobrancaElegivelPreNfse(Cobranca cobranca) {
        var status = cobranca.getStatus();
        if (status != StatusFinanceiro.PAGA && status != StatusFinanceiro.PARCIALMENTE_PAGA) {
            throw new BusinessException("Pre-nota disponivel apenas para cobranca paga ou parcialmente paga");
        }
    }
}
