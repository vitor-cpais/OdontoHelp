package com.OdontoHelpBackend.domain.Consulta.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OrigemAgendamento {

    AGENDADA("Consulta agendada normalmente"),
    AVULSA("Consulta avulsa — sem agenda prévia");

    private final String descricao;
}
