package com.OdontoHelpBackend.dto.Consulta.Response.Agendamento;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record AgendamentoResponseDTO(
        Long id,
        Long pacienteId,
        String pacienteNome,
        Long dentistaId,
        String dentistaNome,
        StatusConsulta status,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataInicio,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataFim,
        String observacoes
) {}
