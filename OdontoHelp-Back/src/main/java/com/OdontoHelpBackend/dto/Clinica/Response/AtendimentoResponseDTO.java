package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response completo do Atendimento.
 * - agendamentoStatus: permite o frontend atualizar a visualização do Agendamento sem novo request.
 * - itens: lista com objetos completos (id + nome do procedimento).
 */
public record AtendimentoResponseDTO(
        Long id,
        Long agendamentoId,
        StatusConsulta agendamentoStatus,   // ← contexto do agendamento pai
        Long dentistaId,
        String dentistaNome,
        Long pacienteId,
        String pacienteNome,
        LocalDateTime horaInicio,
        LocalDateTime horaFim,
        String observacoesGerais,
        StatusAtendimento status,
        List<ItemAtendimentoResponseDTO> itens,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
