package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.constraints.NotNull;

public record IniciarAtendimentoAvulsoRequestDTO(
        @NotNull(message = "Paciente é obrigatório") Long pacienteId,
        Long dentistaId,
        String observacoesGerais,
        String motivo
) {}
