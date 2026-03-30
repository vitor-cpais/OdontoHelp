package com.OdontoHelpBackend.dto.Consulta.Request.Agendamento;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AgendamentoRequestDTO(

        @NotNull(message = "Paciente é obrigatório")
        Long pacienteId,

        @NotNull(message = "Dentista é obrigatório")
        Long dentistaId,

        @NotNull(message = "Data início é obrigatória")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataInicio,

        @NotNull(message = "Data fim é obrigatória")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataFim,

        String observacoes
) {}