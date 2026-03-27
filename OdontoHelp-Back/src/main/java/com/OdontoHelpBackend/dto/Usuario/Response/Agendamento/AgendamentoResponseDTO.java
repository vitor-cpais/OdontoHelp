package com.OdontoHelpBackend.dto.Usuario.Response.Agendamento;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;

import java.time.LocalDateTime;

public record AgendamentoResponseDTO(
        Long id,
        Long pacienteId,
        String pacienteNome,
        Long dentistaId,
        String dentistaNome,
        StatusConsulta status,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        String observacoes
) {}
