package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;

import java.time.LocalDateTime;
import java.util.List;


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
        boolean odontogramaRevisado,
        List<ItemAtendimentoResponseDTO> itens,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
