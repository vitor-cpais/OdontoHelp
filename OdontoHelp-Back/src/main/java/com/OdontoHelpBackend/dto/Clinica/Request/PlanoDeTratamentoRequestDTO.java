package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PlanoDeTratamentoRequestDTO(
        @NotNull(message = "Paciente é obrigatório") Long pacienteId,

        @NotNull(message = "Dentista é obrigatório") Long dentistaId,

        Long atendimentoId, // opcional — plano pode ser criado sem atendimento vinculado
        String observacoes,
        @Valid List<ItemPlanoRequestDTO> itens
) {}
