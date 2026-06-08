package br.com.odontohelp.fiscal.dto;

public record EnderecoDto(
        String logradouro,
        String numero,
        String bairro,
        String municipio,
        String uf,
        String cep
) {
}
