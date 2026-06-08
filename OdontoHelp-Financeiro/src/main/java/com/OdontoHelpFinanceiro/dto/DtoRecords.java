package com.OdontoHelpFinanceiro.dto;

import com.OdontoHelpFinanceiro.domain.enums.FormaPagamento;
import com.OdontoHelpFinanceiro.domain.enums.OrigemCobranca;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class DtoRecords {

    private DtoRecords() {}

    public record ClienteSnapshotDTO(
            Long pacienteId,
            String nome,
            String cpf,
            String email,
            String telefone,
            Boolean ativo
    ) {}

    public record ParcelaInputDTO(
            @NotNull @DecimalMin("0.01") BigDecimal valor,
            @NotNull LocalDate dataVencimento
    ) {}

    public record CriarCobrancaRequest(
            @NotNull Long pacienteId,
            @NotBlank @Size(max = 500) String descricao,
            @NotNull @DecimalMin("0.01") BigDecimal valorBruto,
            @DecimalMin("0.00") BigDecimal valorDesconto,
            @DecimalMin("0.00") BigDecimal valorAcrescimo,
            @Min(1) @Max(60) Integer quantidadeParcelas,
            LocalDate primeiroVencimento,
            OrigemCobranca origemTipo,
            String origemIdExterno,
            String observacao,
            List<ParcelaInputDTO> parcelasCustomizadas,
            String idempotencyKey
    ) {}

    public record CriarRecorrenciaRequest(
            @NotNull @Min(1) @Max(28) Integer diaVencimento,
            @NotNull @DecimalMin("0.01") BigDecimal valorBase,
            @NotNull LocalDate dataInicio,
            LocalDate dataFim,
            String observacao
    ) {}

    public record AtualizarRecorrenciaRequest(
            @Min(1) @Max(28) Integer diaVencimento,
            @DecimalMin("0.01") BigDecimal valorBase,
            LocalDate dataFim,
            LocalDate proximaGeracao,
            String observacao
    ) {}

    public record RegistrarPagamentoRequest(
            @NotNull @DecimalMin("0.01") BigDecimal valor,
            @NotNull LocalDate dataPagamento,
            @NotNull FormaPagamento formaPagamento,
            String referenciaExterna,
            String observacao
    ) {}

    public record AjustarParcelaRequest(
            @DecimalMin("0.00") BigDecimal valorDesconto,
            @DecimalMin("0.00") BigDecimal valorAcrescimo,
            String observacao
    ) {}

    public record AlterarVencimentoRequest(@NotNull LocalDate dataVencimento) {}

    public record PerdoarParcelaRequest(String observacao) {}

    public record CriarPreNfseRequest(
            @NotBlank String descricaoServico,
            @NotNull @DecimalMin("0.01") BigDecimal valorServico,
            String codigoServico,
            BigDecimal aliquotaIss
    ) {}

    public record ItemAtendimentoCobravelDTO(
            Long itemAtendimentoId,
            Long procedimentoId,
            String procedimentoNome,
            BigDecimal valorCobradoSnapshot
    ) {}

    public record MarcarPreNfseEmitidaRequest(@NotBlank @Size(max = 50) String numeroNfse) {}

    public record LembreteCobrancaEmailRequest(
            @NotBlank @Email String email,
            @NotBlank String pacienteNome,
            @NotNull @DecimalMin("0.01") BigDecimal valor,
            @NotNull LocalDate dataVencimento,
            String descricao,
            Long parcelaId
    ) {}

    public record GerarCobrancaAtendimentoRequest(
            @NotNull Long pacienteId,
            @NotNull Long atendimentoId,
            @NotBlank String descricao,
            @NotEmpty List<ItemAtendimentoCobravelDTO> itens,
            @Min(1) @Max(60) Integer quantidadeParcelas,
            LocalDate primeiroVencimento,
            @DecimalMin("0.00") BigDecimal valorDesconto,
            @DecimalMin("0.00") BigDecimal valorAcrescimo,
            String idempotencyKey
    ) {}
}
