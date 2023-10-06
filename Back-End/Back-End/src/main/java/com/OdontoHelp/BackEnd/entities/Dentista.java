package com.OdontoHelp.BackEnd.entities;

import com.OdontoHelp.BackEnd.entities.util.enums.EspecializacaoDentista;

import javax.persistence.*;


@Entity
@Table(name = "tb_dentista")
public class Dentista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private EspecializacaoDentista especializacaoDentista;
    private String telefone;
    private String email;


    // Construtores, getters e setters...


    public Dentista() {
    }

    public Dentista(Long id, String name, EspecializacaoDentista especializacaoDentista, String telefone, String email) {
        this.id = id;
        this.name = name;
        this.especializacaoDentista = especializacaoDentista;
        this.telefone = telefone;
        this.email = email;
    }

    public Long getId() {
        return id;
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

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}









