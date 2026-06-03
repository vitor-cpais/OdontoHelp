package com.OdontoHelpBackend.domain.Consulta.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum StatusConsulta {

    AGENDADO("Consulta agendada no sistema"),
    CONFIRMADO("Paciente confirmou o comparecimento"),
    ATENDIDO("Atendimento clínico iniciado"),
    CANCELADO("Agendamento cancelado"),
    FALTA("Paciente não compareceu ao horário");

    private final String descricao;
}
