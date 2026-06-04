package com.OdontoHelpBackend.dto.Clinica.Response;

import java.time.LocalDateTime;

public record OdontogramaVersaoResponseDTO(
        Long id,
        Integer versao,
        Long atendimentoId,
        String editadoPorNome,
        Integer totalDentesAlterados,
        boolean inicial,
        LocalDateTime criadoEm
) {}
