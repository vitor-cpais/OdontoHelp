package com.OdontoHelp.BackEnd.entities.models;

import com.OdontoHelp.BackEnd.entities.Paciente;


import javax.persistence.*;
import java.time.LocalDateTime;

    @Entity
    public class Observacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String texto;


    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

        public Observacao(String s, LocalDateTime now) {
        }








    // Construtores, getters e setters...


        public Observacao() {
        }

        public Observacao(Long id, String texto) {
        this.id = id;
        this.texto = texto;
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


}