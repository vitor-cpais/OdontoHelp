package com.OdontoHelpBackend.domain.Consulta.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Status do AGENDAMENTO (planejamento da consulta).
 * ATENDIDO é definido pelo backend ao criar o Atendimento — nunca pelo cliente diretamente.
 */
@Getter
@AllArgsConstructor
public enum StatusConsulta {

    AGENDADO("Consulta agendada no sistema"),
    CONFIRMADO("Paciente confirmou o comparecimento"),
    ATENDIDO("Atendimento clínico iniciado"),          // ← NOVO: transição automática pelo backend
    CANCELADO("Agendamento cancelado"),
    FALTA("Paciente não compareceu ao horário");

    private final String descricao;
}
