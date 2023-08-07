package com.OdontoHelp.BackEnd.entities;

import com.OdontoHelp.BackEnd.entities.models.enums.EspecializacaoDentista;

public class Dentista {
    private Long Id;
    private String name;
    private EspecializacaoDentista especializacaoDentista;
    private Integer telefone;
    private String email;

    // Construtores, getters e setters...


    public Dentista() {
    }

    public Dentista(Long id, String name, EspecializacaoDentista especializacaoDentista, Integer telefone, String email) {
        Id = id;
        this.name = name;
        this.especializacaoDentista = especializacaoDentista;
        this.telefone = telefone;
        this.email = email;
    }


    public Long getId() {
        return Id;
    }

    public void setId(Long id) {
        Id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public EspecializacaoDentista getEspecializacaoDentista() {
        return especializacaoDentista;
    }

    public void setEspecializacaoDentista(EspecializacaoDentista especializacaoDentista) {
        this.especializacaoDentista = especializacaoDentista;
    }

    public Integer getTelefone() {
        return telefone;
    }

    public void setTelefone(Integer telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}




