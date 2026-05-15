// ─── ItemPlanoResponseDTO.java ────────────────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Response;


import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;

public record ItemPlanoResponseDTO(
        Long id,
        Long procedimentoId,
        String procedimentoNome,
        Integer numeroDente,
        Integer prioridade,
        StatusItemPlano status,
        String observacao,
        Long atendimentoRealizacaoId
) {}
