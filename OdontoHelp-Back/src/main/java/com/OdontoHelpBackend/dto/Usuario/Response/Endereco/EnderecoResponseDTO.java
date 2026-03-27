package com.OdontoHelpBackend.dto.Usuario.Response.Endereco;

public record EnderecoResponseDTO(
        Long id,
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        String cep,
        Boolean isPrincipal
) {}