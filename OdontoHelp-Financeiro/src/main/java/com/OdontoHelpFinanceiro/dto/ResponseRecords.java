package com.OdontoHelpFinanceiro.dto;

import com.OdontoHelpFinanceiro.domain.*;
import com.OdontoHelpFinanceiro.domain.enums.*;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.ConsultaNfseFiscalResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ResponseRecords {

    private ResponseRecords() {}

    public record ClienteFinanceiroResponse(
            Long id, Long pacienteIdExterno, String nome, String cpf, String email, String telefone, Boolean ativo
    ) {
        public static ClienteFinanceiroResponse from(ClienteFinanceiro c) {
            return new ClienteFinanceiroResponse(
                    c.getId(), c.getPacienteIdExterno(), c.getNome(), c.getCpf(), c.getEmail(), c.getTelefone(), c.getAtivo());
        }
    }

    public record PagamentoResponse(
            Long id, Long parcelaId, BigDecimal valor, LocalDate dataPagamento,
            FormaPagamento formaPagamento, StatusPagamento status, String observacao
    ) {
        public static PagamentoResponse from(Pagamento p) {
            return new PagamentoResponse(
                    p.getId(), p.getParcela().getId(), p.getValor(), p.getDataPagamento(),
                    p.getFormaPagamento(), p.getStatus(), p.getObservacao());
        }
    }

    public record ParcelaResponse(
            Long id, Long cobrancaId, Integer numero, BigDecimal valorTotal, BigDecimal valorPago,
            BigDecimal saldo, LocalDate dataVencimento, StatusFinanceiro status, String observacao,
            String pacienteNome, Long pacienteIdExterno, String pacienteEmail, String pacienteTelefone,
            String cobrancaDescricao
    ) {
        public static ParcelaResponse from(ParcelaReceber p) {
            var cobranca = p.getCobranca();
            var cliente = cobranca.getCliente();
            return new ParcelaResponse(
                    p.getId(), cobranca.getId(), p.getNumero(), p.getValorTotal(),
                    p.getValorPago(), p.getSaldo(), p.getDataVencimento(), p.getStatus(), p.getObservacao(),
                    cliente.getNome(), cliente.getPacienteIdExterno(), cliente.getEmail(), cliente.getTelefone(),
                    cobranca.getDescricao());
        }
    }

    public record CobrancaResponse(
            Long id, ClienteFinanceiroResponse cliente, OrigemCobranca origemTipo, String origemIdExterno,
            String descricao, BigDecimal valorTotal, BigDecimal valorPago, BigDecimal saldoTotal,
            Integer quantidadeParcelas, LocalDate dataEmissao, StatusFinanceiro status,
            String observacao, List<ParcelaResponse> parcelas,
            Boolean recorrenciaAtiva, Boolean recorrenciaPausada, Boolean recorrenciaEncerrada
    ) {
        public static CobrancaResponse from(Cobranca c, List<ParcelaReceber> parcelas) {
            return from(c, parcelas, null);
        }

        public static CobrancaResponse from(Cobranca c, List<ParcelaReceber> parcelas, RecorrenciaCobranca rec) {
            boolean recorrenciaAtiva = rec != null && Boolean.TRUE.equals(rec.getAtiva()) && rec.getDataFim() == null;
            boolean recorrenciaEncerrada = rec != null && rec.getDataFim() != null;
            boolean recorrenciaPausada = rec != null && !Boolean.TRUE.equals(rec.getAtiva()) && rec.getDataFim() == null;
            return new CobrancaResponse(
                    c.getId(), ClienteFinanceiroResponse.from(c.getCliente()), c.getOrigemTipo(), c.getOrigemIdExterno(),
                    c.getDescricao(), c.getValorTotal(), c.getValorPago(), c.getSaldoTotal(),
                    c.getQuantidadeParcelas(), c.getDataEmissao(), c.getStatus(), c.getObservacao(),
                    parcelas.stream().map(ParcelaResponse::from).toList(),
                    recorrenciaAtiva, recorrenciaPausada, recorrenciaEncerrada);
        }
    }

    public record RecorrenciaResponse(
            Long id, Long cobrancaId, FrequenciaRecorrencia frequencia, Integer diaVencimento,
            BigDecimal valorBase, LocalDate dataInicio, LocalDate dataFim, LocalDate proximaGeracao,
            Boolean ativa, Boolean encerrada, String observacao
    ) {
        public static RecorrenciaResponse from(RecorrenciaCobranca r) {
            boolean encerrada = r.getDataFim() != null;
            return new RecorrenciaResponse(
                    r.getId(), r.getCobranca().getId(), r.getFrequencia(), r.getDiaVencimento(),
                    r.getValorBase(), r.getDataInicio(), r.getDataFim(), r.getProximaGeracao(),
                    r.getAtiva(), encerrada, r.getObservacao());
        }
    }

    public record PosicaoFinanceiraResponse(
            Long pacienteId, BigDecimal totalAberto, BigDecimal totalVencido, BigDecimal totalPago,
            List<ParcelaResponse> parcelas
    ) {}

    public record DashboardResumoResponse(
            BigDecimal totalAberto, BigDecimal totalVencido, BigDecimal recebidoMes,
            BigDecimal previsaoRecebimento, long parcelasVencidas
    ) {}

    public record PreNfseResponse(
            Long id, Long cobrancaId, Long pacienteIdExterno, String pacienteNome,
            String descricaoServico, BigDecimal valorServico, String codigoServico,
            StatusPreNfse status, String numeroNfse, LocalDateTime criadoEm, LocalDateTime emitidaEm
    ) {
        public static PreNfseResponse from(PreNfse p) {
            var cliente = p.getCliente();
            return new PreNfseResponse(
                    p.getId(), p.getCobranca().getId(),
                    cliente.getPacienteIdExterno(), cliente.getNome(),
                    p.getDescricaoServico(), p.getValorServico(), p.getCodigoServico(),
                    p.getStatus(), p.getNumeroNfse(), p.getCriadoEm(), p.getEmitidaEm());
        }
    }

    public record NfseConfigResponse(
            boolean habilitado,
            String modoEmissao,
            String portalOxyUrl,
            String emissorRazaoSocial,
            String emissorCnpjMascarado
    ) {}

    public record NfseFiscalResponse(
            String id,
            String externalChargeId,
            String externalCustomerId,
            String pacienteNome,
            String descricaoServico,
            java.math.BigDecimal valor,
            String status,
            String nfseNumero,
            String mensagem,
            Instant criadoEm,
            Instant atualizadoEm
    ) {
        public static NfseFiscalResponse from(ConsultaNfseFiscalResponse r) {
            return from(r, null, null, null);
        }

        public static NfseFiscalResponse from(ConsultaNfseFiscalResponse r,
                                              String pacienteNome,
                                              String descricaoServico,
                                              java.math.BigDecimal valor) {
            return new NfseFiscalResponse(
                    r.id(),
                    r.externalChargeId(),
                    r.externalCustomerId(),
                    pacienteNome,
                    descricaoServico,
                    valor,
                    r.status(),
                    r.nfseNumero(),
                    r.mensagem(),
                    r.criadoEm(),
                    r.atualizadoEm()
            );
        }
    }
}
