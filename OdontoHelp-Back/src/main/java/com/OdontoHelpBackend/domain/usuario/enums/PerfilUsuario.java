package com.OdontoHelpBackend.domain.usuario.enums;

public enum PerfilUsuario {

    ADMIN("Administrador do Sistema"),
    DENTISTA("Cirurgião Dentista"),
    PACIENTE("Paciente da Clínica"),
    RECEPCAO("Equipe de Recepção");

    private final String descricao;

    PerfilUsuario(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
