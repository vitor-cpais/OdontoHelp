package br.com.odontohelp.fiscal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TomadorDto(
        @NotBlank String nome,
        @Pattern(regexp = "\\d{11}|\\d{14}") String cpfCnpj,
        String email,
        EnderecoDto endereco
) {
}
