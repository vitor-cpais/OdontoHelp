package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;

import java.time.LocalDateTime;

public record HistoricoOdontogramaResponseDTO(
        Long id,
        Integer numeroDente,
        SituacaoDente situacaoAnterior,
        SituacaoDente situacaoNova,
        Long dentistaId,
        String dentistaNome,
        Long atendimentoId,       // null quando atualização direta (sem atendimento formal)
        String observacao,
        LocalDateTime registradoEm
) {}
