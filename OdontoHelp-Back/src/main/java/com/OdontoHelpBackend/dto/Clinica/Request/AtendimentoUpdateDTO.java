package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Atualização de atendimento EM_ANDAMENTO.
 * Permite editar observações e substituir a lista de itens.
 * Só aceito enquanto status == EM_ANDAMENTO.
 *
 * horaFim NÃO é editável — é definida automaticamente ao finalizar.
 * horaInicio NÃO é editável — é definida ao iniciar.
 */
public record AtendimentoUpdateDTO(
        String observacoesGerais,
        @Valid List<ItemAtendimentoRequestDTO> itens
) {}
