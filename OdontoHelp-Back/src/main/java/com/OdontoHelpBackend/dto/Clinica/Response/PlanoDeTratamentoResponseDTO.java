// ─── PlanoDeTratamentoResponseDTO.java ───────────────────────────────────────
package com.OdontoHelpBackend.dto.Clinica.Response;

import java.time.LocalDateTime;
import java.util.List;

public record PlanoDeTratamentoResponseDTO(
        Long id,
        Long pacienteId,
        String pacienteNome,
        Long dentistaId,
        String dentistaNome,
        Long atendimentoId,
        String observacoes,
        List<ItemPlanoResponseDTO> itens,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
