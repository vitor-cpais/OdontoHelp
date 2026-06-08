package com.OdontoHelpBackend.dto.Usuario.Response.Paciente;

import java.time.LocalDate;

public record PacienteDadosPessoaisDTO(
        Long id,
        String nome,
        String cpf,
        String email,
        String telefone,
        String genero,
        LocalDate dataNascimento,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        String cep,
        String observacoesMedicas
) {}
