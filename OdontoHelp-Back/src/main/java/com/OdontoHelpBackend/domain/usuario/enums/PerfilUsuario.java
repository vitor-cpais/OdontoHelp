package com.OdontoHelpBackend.domain.usuario.enums;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Table(name = "TB_TIPO_PERFIS")
@Getter
@AllArgsConstructor
public enum PerfilUsuario {

    ADMIN("Administrador do Sistema"),
    DENTISTA("Cirurgião Dentista"),
    PACIENTE("Paciente da Clínica"),
    RECEPCAO("Equipe de Recepção");

    private final String descricao;
}