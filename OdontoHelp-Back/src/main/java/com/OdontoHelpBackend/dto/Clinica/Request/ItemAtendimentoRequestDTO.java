// ─── ItemAtendimentoRequestDTO.java ──────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Request;


import com.OdontoHelpBackend.domain.Clinico.Enums.FaceDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import jakarta.validation.constraints.*;

public record ItemAtendimentoRequestDTO(
        @NotNull(message = "Procedimento é obrigatório") Long procedimentoId,
        @NotNull @Min(11) @Max(48) Integer numeroDente,
        FaceDente face,
        @NotNull(message = "Situação identificada é obrigatória") SituacaoDente situacaoIdentificada,
        String observacao
) {}
