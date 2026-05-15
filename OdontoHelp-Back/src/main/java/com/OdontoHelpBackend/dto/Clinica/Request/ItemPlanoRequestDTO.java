// ─── ItemPlanoRequestDTO.java ─────────────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.constraints.*;

public record ItemPlanoRequestDTO(
        @NotNull(message = "Procedimento é obrigatório") Long procedimentoId,
        @NotNull @Min(11) @Max(48) Integer numeroDente,
        @NotNull @Min(1) @Max(3) Integer prioridade,
        String observacao
) {}
