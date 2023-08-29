package com.OdontoHelp.BackEnd.entities;


import com.OdontoHelp.BackEnd.entities.models.Endereco;
import com.OdontoHelp.BackEnd.entities.models.enums.Genero;
import javax.persistence.*;


import java.time.LocalDate;
import java.util.List;
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




    // Outros atributos e métodos relacionados ao Paciente...



    @Override
    public String toString() {
        return "Paciente{" +
                "nome='" + name + '\'' +
                ", dataNascimento=" + dataNascimento +
                ", genero=" + genero +
                ", cpf='" + cpf + '\'' +
                ", email='" + email + '\'' +
                ", telefone='" + telefone + '\'' +
                ", endereco=" + endereco +
                '}';
    }



    // Método para adicionar uma nova observação à lista---




         // Construtores, getters e setters...

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


