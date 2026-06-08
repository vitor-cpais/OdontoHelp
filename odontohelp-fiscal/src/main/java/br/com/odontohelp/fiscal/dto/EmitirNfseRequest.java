package br.com.odontohelp.fiscal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record EmitirNfseRequest(
        @NotBlank String tenantId,
        @NotBlank String externalChargeId,
        @NotBlank String externalCustomerId,
        @NotNull @Positive BigDecimal valor,
        @NotBlank String descricaoServico,
        @NotNull TomadorDto tomador
) {
}
