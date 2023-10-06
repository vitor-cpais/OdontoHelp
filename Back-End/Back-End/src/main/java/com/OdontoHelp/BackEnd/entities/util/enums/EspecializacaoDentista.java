package com.OdontoHelp.BackEnd.entities.util.enums;

public enum EspecializacaoDentista {
    CLINICO_GERAL("Clínico Geral"),
    ORTODONTISTA("Ortodontista"),
    ENDODONTISTA("Endodontista"),
    CIRURGIAO_BUCOMAXILOFACIAL("Cirurgião Bucomaxilofacial"),
    PERIODONTISTA("Periodontista"),
    IMPLANTODONTISTA("Implantodontista"),
    ODONTOPEDIATRA("Odontopediatra"),
    OUTRA("Outra");

    private final String descricao;

    EspecializacaoDentista(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
