package br.com.odontohelp.fiscal.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrarNumeroRequest(
        @NotBlank String nfseNumero
) {
}
