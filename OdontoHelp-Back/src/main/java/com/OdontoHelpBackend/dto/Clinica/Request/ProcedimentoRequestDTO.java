// ─── ProcedimentoRequestDTO.java ─────────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProcedimentoRequestDTO(
        @NotBlank(message = "Nome é obrigatório") String nome,
        String descricao,
        @NotNull @Positive BigDecimal valorBase,
        @NotNull @Positive Integer duracaoMinutos,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor inválida. Use formato #RRGGBB") String corLegenda
) {}
