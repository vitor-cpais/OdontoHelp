package com.OdontoHelpBackend.domain.Clinico.Enums;

public enum StatusItemPlano {
    PENDENTE,       // identificado, ainda não iniciado
    EM_ANDAMENTO,   // em execução — para tratamentos contínuos (aparelho, implante em fases)
    REALIZADO,      // concluído
    CANCELADO       // descartado
}
