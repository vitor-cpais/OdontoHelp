package com.OdontoHelpBackend.dto.Clinica.Response;

import java.util.List;

public record AtendimentoUpdateResultDTO(
        AtendimentoResponseDTO atendimento,
        List<ItemPlanoResponseDTO> itensPlanoBaixaManual
) {}
