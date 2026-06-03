package com.OdontoHelpBackend.dto.Clinica.Request;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import jakarta.validation.constraints.*;

public record ItemAtendimentoRequestDTO(
        @NotNull(message = "Procedimento é obrigatório") Long procedimentoId,
        @NotNull @Min(11) @Max(48) Integer numeroDente,
        @NotNull(message = "Situação do dente é obrigatória") SituacaoDente situacaoNova,
        String observacao
) {}
