package com.OdontoHelpBackend.dto.Usuario.Response.Paciente;

import java.time.LocalDateTime;

public record PacienteObservacaoResponseDTO(
        Long id,
        Long pacienteId,
        String texto,
        Long autorId,
        String autorNome,
        LocalDateTime criadoEm
) {}
