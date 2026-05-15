// ─── ProcedimentoResponseDTO.java ────────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Response;

import java.math.BigDecimal;

public record ProcedimentoResponseDTO(
        Long id,
        String nome,
        String descricao,
        BigDecimal valorBase,
        Integer duracaoMinutos,
        String corLegenda,
        Boolean isAtivo
) {}
