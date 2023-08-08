package com.OdontoHelp.BackEnd.entities;
import com.OdontoHelp.BackEnd.entities.models.Endereco;
import com.OdontoHelp.BackEnd.entities.models.Observacao;
import com.OdontoHelp.BackEnd.entities.models.enums.Genero;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;
@Entity
@Table(name = "tb_paciente")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;
    private String Name;
    private LocalDate dataNascimento;
    private Genero genero;
    private Long telefone;
    private String email;
    @Embedded
    private Endereco endereco;


    @OneToMany(mappedBy = "paciente")
    private List<Observacao> observacoes; // Lista de observações do paciente


    // Outros atributos e métodos relacionados ao Paciente...

    // Método para adicionar uma nova observação à lista---
    public void adicionarObservacao(Observacao observacao) {
        observacoes.add(observacao);
    }



    // Método para obter as últimas n observações do paciente
    public List<Observacao> getUltimasObservacoes(int n) {
        int startIndex = Math.max(0, observacoes.size() - n);
        int endIndex = observacoes.size();
        return observacoes.subList(startIndex, endIndex);





    }       // Construtores, getters e setters...

    public Paciente() {
    }

    public Paciente(Long id, String name, LocalDate dataNascimento, Genero genero, Long telefone, String email, Endereco endereco, List<Observacao> observacoes) {
        Id = id;
        Name = name;
        this.dataNascimento = dataNascimento;
        this.genero = genero;
        this.telefone = telefone;
        this.email = email;
        this.endereco = endereco;
        this.observacoes = observacoes;
    }

    public Long getId() {
        return Id;
    }

    public void setId(Long id) {
        Id = id;
    }

    public String getName() {
        return Name;
    }

    public void setName(String name) {
        Name = name;
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

    public Long getTelefone() {
        return telefone;
    }

    public void setTelefone(Long telefone) {
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

    public List<Observacao> getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(List<Observacao> observacoes) {
        this.observacoes = observacoes;
    }
}

