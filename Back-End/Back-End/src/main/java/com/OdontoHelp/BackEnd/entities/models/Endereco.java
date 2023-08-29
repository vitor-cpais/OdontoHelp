package com.OdontoHelp.BackEnd.entities.models;


import javax.persistence.*;


@Embeddable
public class Endereco {
    private String rua;
    private String numero;
    private String bairro;
    private String cidade;
    private String cep;
    // Outros atributos e métodos relacionados ao endereço...



    // Método toString para retornar o endereço formatado
    @Override
    public String toString() {
        return rua + ", " + numero + ", " + bairro + ", " + cidade + ", " + cep;
    }

    // Construtores, getters e setters...





    public Endereco() {
    }

    public Endereco(String rua, String numero, String bairro, String cidade, String cep) {
        this.rua = rua;
        this.numero = numero;
        this.bairro = bairro;
        this.cidade = cidade;
        this.cep = cep;
    }

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }
}