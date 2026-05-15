// ─── AtendimentoRequestDTO.java ──────────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record AtendimentoRequestDTO(
        @NotNull(message = "Agendamento é obrigatório") Long agendamentoId,
        @NotNull(message = "Hora de início é obrigatória")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime horaInicio,
        String observacoesGerais,
        @Valid List<ItemAtendimentoRequestDTO> itens
) {}
