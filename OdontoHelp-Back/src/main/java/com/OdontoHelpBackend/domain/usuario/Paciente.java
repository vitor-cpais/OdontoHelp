package com.OdontoHelpBackend.domain.usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TB_PACIENTE")
@PrimaryKeyJoinColumn(name = "USUARIO_ID")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Paciente extends Usuario {

    @Column(name = "OBSERVACOES_MEDICAS", columnDefinition = "TEXT")
    private String observacoesMedicas;
}