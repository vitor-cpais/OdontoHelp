package com.OdontoHelpBackend.dto.Usuario.Response.Paciente;

public record PacienteSnapshotFinanceiroDTO(
        Long pacienteId,
        String nome,
        String cpf,
        String email,
        String telefone,
        Boolean ativo
) {}
