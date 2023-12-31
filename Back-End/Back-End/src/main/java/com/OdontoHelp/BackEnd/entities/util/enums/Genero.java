package com.OdontoHelp.BackEnd.entities.util.enums;

public enum Genero {
    MALE("Masculino"),
    FEMALE("Feminino"),
    OTHER("Outro");

    private final String descricao;

    Genero(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}