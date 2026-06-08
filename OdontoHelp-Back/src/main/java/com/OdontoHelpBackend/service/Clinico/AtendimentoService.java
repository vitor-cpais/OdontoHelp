package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.Mapper.AtendimentoMapper;
import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusCobrancaItem;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.BaixaPlanoManualRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.IniciarAtendimentoAvulsoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.IniciarAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.MarcarItemCobradoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoPendenteCobrancaDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoUpdateResultDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPendenteCobrancaDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPlanoResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.ItemAtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.ItemPlanoDeTratamentoRepository;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.service.Consulta.AgendamentoService;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AtendimentoService {

    private static final int DURACAO_SLOT_AVULSO_MINUTOS = 30;

    private final AtendimentoRepository atendimentoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AtendimentoMapper atendimentoMapper;
    private final AgendamentoService agendamentoService;
    private final DentistaService dentistaService;
    private final PacienteService pacienteService;
    private final ProcedimentoService procedimentoService;
    private final OdontogramaService odontogramaService;
    private final ItemPlanoDeTratamentoRepository itemPlanoRepository;
    private final ItemAtendimentoRepository itemAtendimentoRepository;

    public AtendimentoResponseDTO buscarPorId(Long id, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);
        return atendimentoMapper.toResponse(atendimento);
    }

    public Slice<AtendimentoResponseDTO> listarPorPaciente(Long pacienteId, Pageable pageable, Usuario usuarioLogado) {
        return atendimentoRepository.findByPacienteId(pacienteId, pageable)
                .map(atendimentoMapper::toResponse);
    }

    public Slice<AtendimentoResponseDTO> listarPorDentista(
            Long dentistaId, String nomePaciente,
            LocalDateTime dataInicio, LocalDateTime dataFim,
            StatusAtendimento status, Pageable pageable, Usuario usuarioLogado) {

        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            if (!dentistaLogado.getId().equals(dentistaId))
                throw new AcessoNegadoException("Você não tem permissão para ver atendimentos de outro dentista");
        }

        return atendimentoRepository
                .filtrarPorDentista(dentistaId, nomePaciente, dataInicio, dataFim, status, pageable)
                .map(atendimentoMapper::toResponse);
    }

    public Slice<AtendimentoResponseDTO> listarTodos(
            String nomePaciente, LocalDateTime dataInicio,
            LocalDateTime dataFim, StatusAtendimento status, Pageable pageable, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            return atendimentoRepository
                    .filtrarPorDentista(dentistaLogado.getId(), nomePaciente, dataInicio, dataFim, status, pageable)
                    .map(atendimentoMapper::toResponse);
        }

        return atendimentoRepository
                .filtrarTodos(nomePaciente, dataInicio, dataFim, status, pageable)
                .map(atendimentoMapper::toResponse);
    }

    public Slice<AtendimentoPendenteCobrancaDTO> listarPendentesCobranca(
            String nomePaciente, Long dentistaId,
            LocalDate dataFinalizacaoDe, LocalDate dataFinalizacaoAte,
            Pageable pageable, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMIN
                && usuarioLogado.getPerfil() != PerfilUsuario.RECEPCAO) {
            throw new AcessoNegadoException("Sem permissao para listar atendimentos pendentes de cobranca");
        }
        LocalDateTime inicio = dataFinalizacaoDe != null ? dataFinalizacaoDe.atStartOfDay() : null;
        LocalDateTime fim = dataFinalizacaoAte != null ? dataFinalizacaoAte.atTime(LocalTime.MAX) : null;
        String nome = (nomePaciente != null && !nomePaciente.isBlank()) ? nomePaciente.trim() : null;
        return atendimentoRepository.findPendentesCobranca(nome, dentistaId, inicio, fim, pageable)
                .map(this::toPendenteCobranca);
    }

    private AtendimentoPendenteCobrancaDTO toPendenteCobranca(Atendimento atendimento) {
        var itens = atendimento.getItens().stream()
                .filter(i -> i.getStatusCobranca() == StatusCobrancaItem.PENDENTE)
                .map(i -> new ItemPendenteCobrancaDTO(
                        i.getId(),
                        i.getProcedimento().getId(),
                        i.getProcedimento().getNome(),
                        i.getNumeroDente(),
                        i.getValorCobradoSnapshot()))
                .toList();
        BigDecimal total = itens.stream()
                .map(ItemPendenteCobrancaDTO::valorCobradoSnapshot)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new AtendimentoPendenteCobrancaDTO(
                atendimento.getId(),
                atendimento.getPaciente().getId(),
                atendimento.getPaciente().getNome(),
                atendimento.getDentista().getNome(),
                atendimento.getHoraFim(),
                itens,
                total);
    }

    @Transactional
    public AtendimentoResponseDTO iniciarAtendimento(Long agendamentoId,
                                                      IniciarAtendimentoRequestDTO dto,
                                                      Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode iniciar atendimentos clínicos");

        if (atendimentoRepository.existsByAgendamentoId(agendamentoId))
            throw new ConflictException("Já existe um atendimento para este agendamento");

        Agendamento agendamento = agendamentoService.buscarEntidadePorId(agendamentoId);

        if (agendamento.getStatus() != StatusConsulta.AGENDADO
                && agendamento.getStatus() != StatusConsulta.CONFIRMADO) {
            throw new BusinessException(
                "Não é possível iniciar atendimento para um agendamento com status: "
                + agendamento.getStatus().getDescricao());
        }

        Dentista dentista = resolverDentista(usuarioLogado, agendamento);
        String observacoes = dto != null ? dto.observacoesGerais() : null;
        Atendimento atendimento = Atendimento.iniciar(agendamento, dentista, observacoes);

        agendamento.setStatus(StatusConsulta.ATENDIDO);
        agendamentoRepository.save(agendamento);

        odontogramaService.garantirSnapshotInicialSeNecessario(agendamento.getPaciente().getId());

        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public AtendimentoResponseDTO iniciarAtendimentoAvulso(IniciarAtendimentoAvulsoRequestDTO dto,
                                                           Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode iniciar atendimentos clínicos");

        var paciente = pacienteService.buscarEntidadePorId(dto.pacienteId());
        if (!paciente.getIsAtivo())
            throw new BusinessException("Paciente inativo não pode realizar atendimentos");

        Dentista dentista = resolverDentistaAvulso(usuarioLogado, dto.dentistaId());
        if (!dentista.getIsAtivo())
            throw new BusinessException("Dentista inativo não pode realizar atendimentos");

        String observacoesAgendamento = montarObservacoesAvulso(dto.motivo());
        Agendamento agendamento = Agendamento.criarAvulso(
                paciente, dentista, observacoesAgendamento, DURACAO_SLOT_AVULSO_MINUTOS);
        agendamento = agendamentoRepository.save(agendamento);

        IniciarAtendimentoRequestDTO iniciarDto = new IniciarAtendimentoRequestDTO(dto.observacoesGerais());
        return iniciarAtendimento(agendamento.getId(), iniciarDto, usuarioLogado);
    }

    @Transactional
    public AtendimentoUpdateResultDTO atualizar(Long id, AtendimentoUpdateDTO dto, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        if (dto.observacoesGerais() != null)
            atendimento.atualizarObservacoes(dto.observacoesGerais());

        List<ItemPlanoResponseDTO> baixaManual = new ArrayList<>();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            Set<String> existentes = new HashSet<>();
            atendimento.getItens().forEach(i ->
                    existentes.add(chave(i.getNumeroDente(), i.getProcedimento().getId())));

            List<ItemAtendimento> novosItens = new ArrayList<>();

            for (ItemAtendimentoRequestDTO itemDto : dto.itens()) {
                String key = chave(itemDto.numeroDente(), itemDto.procedimentoId());
                if (existentes.contains(key)) continue;

                ItemAtendimento item = atendimentoMapper.itemToEntity(itemDto);
                item.definirProcedimentoCobravel(procedimentoService.buscarEntidadePorId(itemDto.procedimentoId()));
                atendimento.adicionarItem(item);
                novosItens.add(item);

                baixaAutomatica(atendimento, item);
                baixaManual.addAll(buscarItensBaixaManual(
                        atendimento.getPaciente().getId(),
                        item.getNumeroDente(),
                        item.getProcedimento().getId()
                ));

                existentes.add(key);
            }

            if (!novosItens.isEmpty()) {
                odontogramaService.registrarPorItensAtendimento(
                        atendimento.getPaciente(), novosItens, atendimento, usuarioLogado);
            }
        }

        Atendimento salvo = atendimentoRepository.save(atendimento);
        return new AtendimentoUpdateResultDTO(
                atendimentoMapper.toResponse(salvo),
                baixaManual.stream().distinct().toList()
        );
    }

    @Transactional
    public AtendimentoResponseDTO finalizarAtendimento(Long id, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);
        atendimento.finalizar();
        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public void removerItem(Long atendimentoId, Long itemId, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(atendimentoId);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        ItemAtendimento item = itemAtendimentoRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item de atendimento não encontrado"));

        if (!item.getAtendimento().getId().equals(atendimentoId))
            throw new BusinessException("Item não pertence a este atendimento");

        if (atendimento.getStatus() == StatusAtendimento.FINALIZADO)
            throw new BusinessException("Não é permitido remover item de um atendimento finalizado");

        atendimento.getItens().remove(item);
        itemAtendimentoRepository.delete(item);
        atendimentoRepository.save(atendimento);
    }

    @Transactional
    public void marcarItemCobrado(Long itemId, MarcarItemCobradoRequestDTO dto, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMIN
                && usuarioLogado.getPerfil() != PerfilUsuario.RECEPCAO) {
            throw new AcessoNegadoException("Sem permissao para marcar cobranca");
        }
        ItemAtendimento item = itemAtendimentoRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item de atendimento nao encontrado"));
        if (item.getStatusCobranca() == StatusCobrancaItem.COBRADO
                || item.getStatusCobranca() == StatusCobrancaItem.ENVIADO) {
            throw new ConflictException("Item ja vinculado a cobranca");
        }
        item.setStatusCobranca(StatusCobrancaItem.ENVIADO);
        item.setFinanceiroCobrancaId(String.valueOf(dto.financeiroCobrancaId()));
        item.setCobrancaEnviadaEm(LocalDateTime.now());
        itemAtendimentoRepository.save(item);
    }

    @Transactional
    public AtendimentoResponseDTO marcarOdontogramaRevisado(Long id, boolean revisado, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);
        atendimento.marcarOdontogramaRevisado(revisado);
        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public AtendimentoResponseDTO baixaPlanoManual(Long atendimentoId, BaixaPlanoManualRequestDTO dto,
                                                    Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(atendimentoId);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        for (Long itemPlanoId : dto.itemPlanoIds()) {
            ItemPlanoDeTratamento item = itemPlanoRepository.findById(itemPlanoId)
                    .orElseThrow(() -> new NotFoundException("Item do plano não encontrado"));

            if (item.getStatus() == StatusItemPlano.REALIZADO)
                throw new BusinessException("Item do plano já foi realizado");

            item.setStatus(StatusItemPlano.REALIZADO);
            item.setAtendimentoRealizacao(atendimento);
            itemPlanoRepository.save(item);
        }

        return atendimentoMapper.toResponse(atendimento);
    }

    public Atendimento buscarEntidadePorId(Long id) {
        return atendimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Atendimento não encontrado"));
    }

    private void baixaAutomatica(Atendimento atendimento, ItemAtendimento item) {
        itemPlanoRepository
                .findByPacienteIdAndNumeroDenteAndProcedimentoIdAndStatus(
                        atendimento.getPaciente().getId(),
                        item.getNumeroDente(),
                        item.getProcedimento().getId(),
                        StatusItemPlano.PENDENTE
                )
                .forEach(planoItem -> {
                    planoItem.setStatus(StatusItemPlano.REALIZADO);
                    planoItem.setAtendimentoRealizacao(atendimento);
                    itemPlanoRepository.save(planoItem);
                });
    }

    private List<ItemPlanoResponseDTO> buscarItensBaixaManual(Long pacienteId, Integer numeroDente, Long procedimentoId) {
        return itemPlanoRepository
                .findByPacienteIdAndNumeroDenteAndStatus(pacienteId, numeroDente, StatusItemPlano.PENDENTE)
                .stream()
                .filter(i -> !i.getProcedimento().getId().equals(procedimentoId))
                .map(i -> new ItemPlanoResponseDTO(
                        i.getId(),
                        i.getProcedimento().getId(),
                        i.getProcedimento().getNome(),
                        i.getNumeroDente(),
                        i.getPrioridade(),
                        i.getStatus(),
                        i.getObservacao(),
                        i.getAtendimentoRealizacao() != null ? i.getAtendimentoRealizacao().getId() : null
                ))
                .toList();
    }

    private static String chave(Integer dente, Long procedimentoId) {
        return dente + ":" + procedimentoId;
    }

    private void validarPropriedadeAtendimento(Atendimento atendimento, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.DENTISTA) return;
        Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        if (!atendimento.getDentista().getId().equals(dentistaLogado.getId()))
            throw new AcessoNegadoException("Você não tem permissão para alterar este atendimento");
    }

    private Dentista resolverDentista(Usuario usuarioLogado, Agendamento agendamento) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            if (!agendamento.getDentista().getId().equals(dentistaLogado.getId()))
                throw new AcessoNegadoException("Você não pode iniciar atendimento para consulta de outro dentista");
            return dentistaLogado;
        }
        return agendamento.getDentista();
    }

    private Dentista resolverDentistaAvulso(Usuario usuarioLogado, Long dentistaId) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            return dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        }
        if (dentistaId == null)
            throw new BusinessException("Dentista é obrigatório para iniciar atendimento avulso");
        return dentistaService.buscarEntidadePorId(dentistaId);
    }

    private static String montarObservacoesAvulso(String motivo) {
        String base = "[Consulta avulsa]";
        if (motivo == null || motivo.isBlank())
            return base;
        return base + " " + motivo.trim();
    }
}
