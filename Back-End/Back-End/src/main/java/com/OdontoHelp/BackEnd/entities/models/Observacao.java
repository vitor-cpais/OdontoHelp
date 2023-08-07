package com.OdontoHelp.BackEnd.entities.models;

import java.time.LocalDateTime;

public class Observacao {
    private Long id;
    private String texto;
    private LocalDateTime dataRegistro;
    // Outros atributos relacionados, se necessário...


    // Construtores, getters e setters...

    public Observacao() {
    }

    public Observacao(Long id, String texto, LocalDateTime dataRegistro) {
        this.id = id;
        this.texto = texto;
        this.dataRegistro = dataRegistro;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }
}