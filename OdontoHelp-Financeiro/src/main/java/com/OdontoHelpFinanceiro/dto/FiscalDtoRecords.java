package com.OdontoHelpFinanceiro.dto;

import java.math.BigDecimal;
import java.time.Instant;

public final class FiscalDtoRecords {

    private FiscalDtoRecords() {}

    public record EnderecoFiscalDto(
            String logradouro,
            String numero,
            String bairro,
            String municipio,
            String uf,
            String cep
    ) {}

    public record TomadorFiscalDto(
            String nome,
            String cpfCnpj,
            String email,
            EnderecoFiscalDto endereco
    ) {}

    public record EmitirNfseFiscalRequest(
            String tenantId,
            String externalChargeId,
            String externalCustomerId,
            BigDecimal valor,
            String descricaoServico,
            TomadorFiscalDto tomador
    ) {}

    public record EmitirNfseFiscalResponse(
            String id,
            String tenantId,
            String status,
            String mensagem,
            String nfseNumero,
            Instant criadoEm
    ) {}

    public record ConsultaNfseFiscalResponse(
            String id,
            String tenantId,
            String externalChargeId,
            String externalCustomerId,
            String status,
            String nfseNumero,
            String mensagem,
            Instant criadoEm,
            Instant atualizadoEm
    ) {}

    public record RegistrarNfseNumeroFiscalRequest(String nfseNumero) {}

    public record FiscalPageResponse<T>(
            java.util.List<T> content,
            long totalElements,
            int totalPages,
            int number,
            int size
    ) {}
}
