package com.OdontoHelpBackend.domain.Consulta.enums;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
@Table(name = "TB_STATUS_CONSULTA")
public enum StatusConsulta {

    AGENDADO("Consulta agendada no sistema"),
    CONFIRMADO("Paciente confirmou o comparecimento"),
    CONCLUIDO("Atendimento finalizado com sucesso"),
    CANCELADO("Agendamento cancelado"),
    FALTOU("Paciente não compareceu ao horário");

    private final String descricao;
}
