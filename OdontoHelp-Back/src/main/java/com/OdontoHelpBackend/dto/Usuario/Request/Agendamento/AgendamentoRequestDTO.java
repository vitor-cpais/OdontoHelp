package com.OdontoHelpBackend.dto.Usuario.Request.Agendamento;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AgendamentoRequestDTO(

        @NotNull(message = "Paciente é obrigatório")
        Long pacienteId,

        @NotNull(message = "Dentista é obrigatório")
        Long dentistaId,

        @NotNull(message = "Data início é obrigatória")
        LocalDateTime dataInicio,

        @NotNull(message = "Data fim é obrigatória")
        LocalDateTime dataFim,

        String observacoes
) {}