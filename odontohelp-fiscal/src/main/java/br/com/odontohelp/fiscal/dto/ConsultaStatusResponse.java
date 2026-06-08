package br.com.odontohelp.fiscal.dto;

import java.time.Instant;

public record ConsultaStatusResponse(
        String id,
        String tenantId,
        String externalChargeId,
        String externalCustomerId,
        StatusNfse status,
        String nfseNumero,
        String mensagem,
        Instant criadoEm,
        Instant atualizadoEm
) {
}
