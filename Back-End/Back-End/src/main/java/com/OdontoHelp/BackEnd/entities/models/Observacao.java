package com.OdontoHelp.BackEnd.entities.models;

import com.OdontoHelp.BackEnd.entities.Paciente;
import jakarta.persistence.*;

import java.time.LocalDateTime;

    @Entity
    public class Observacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String texto;
    private LocalDateTime dataRegistro;
    // Outros atributos relacionados, se necessário...


    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

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