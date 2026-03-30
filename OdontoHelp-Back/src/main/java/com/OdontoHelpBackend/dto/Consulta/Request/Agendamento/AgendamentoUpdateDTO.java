package com.OdontoHelpBackend.dto.Consulta.Request.Agendamento;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AgendamentoUpdateDTO(

        @NotNull(message = "Data início é obrigatória")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataInicio,

        @NotNull(message = "Data fim é obrigatória")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataFim,

        String observacoes
) {}
