package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;

public record ItemAtendimentoResponseDTO(
        Long id,
        Long procedimentoId,
        String procedimentoNome,
        Integer numeroDente,
        SituacaoDente situacaoNova,
        String observacao
) {}
