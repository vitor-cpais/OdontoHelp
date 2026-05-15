// ─── OdontogramaResponseDTO.java ─────────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Response;


import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;

import java.time.LocalDateTime;

public record OdontogramaResponseDTO(
        Long id,
        Integer numeroDente,
        SituacaoDente situacaoAtual,
        String observacao,
        LocalDateTime atualizadoEm
) {}
