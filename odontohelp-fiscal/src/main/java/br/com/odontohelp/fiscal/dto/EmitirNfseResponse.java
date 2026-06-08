package br.com.odontohelp.fiscal.dto;

import java.time.Instant;

public record EmitirNfseResponse(
        String id,
        String tenantId,
        String status,
        String mensagem,
        String nfseNumero,
        Instant criadoEm
) {
}
