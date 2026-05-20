package com.OdontoHelpBackend.dto.Clinica.Request;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import jakarta.validation.constraints.NotNull;

public record AtualizarDenteRequestDTO(
        @NotNull(message = "Situação é obrigatória")
        SituacaoDente situacaoAtual,

        String observacao
) {}
