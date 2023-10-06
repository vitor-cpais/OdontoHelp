package com.OdontoHelp.BackEnd.entities;

import com.OdontoHelp.BackEnd.entities.util.Endereco;
import com.OdontoHelp.BackEnd.entities.util.enums.Genero;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.Period;

@Entity
@Table(name = "tb_paciente")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;
    private String name;
    private LocalDate dataNascimento;

    private Genero genero;
    private String telefone;
    private String email;
    private String cpf;

    @Embedded
    private Endereco endereco;

    // Não use @Transient para a idade

    public Paciente() {
    }

    public Paciente(Long id, String name, LocalDate dataNascimento, Genero genero, String telefone, String email, String cpf, Endereco endereco) {
        Id = id;
        this.name = name;
        this.dataNascimento = dataNascimento;
        this.genero = genero;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
        this.endereco = endereco;
    }

    // Calcula a idade com base na data de nascimento.
    public int getIdade() {
        LocalDate dataAtual = LocalDate.now();
        return Period.between(dataNascimento, dataAtual).getYears();
    }

    @Override
    public String toString() {
        return "Paciente{" +
                "nome='" + name + '\'' +
                ", data de nascimento='" + dataNascimento + '\'' +
                ", idade='" + getIdade() + " anos" + '\'' +
                ", genero=" + genero +
                ", cpf='" + cpf + '\'' +
                ", email='" + email + '\'' +
                ", telefone='" + telefone + '\'' +
                ", endereco=" + endereco +
                '}';
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
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

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Genero getGenero() {
        return genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
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

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }
}
