package com.OdontoHelpBackend.domain.usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TB_DENTISTA")
@PrimaryKeyJoinColumn(name = "USUARIO_ID")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Dentista extends Usuario {

    @Pattern(regexp = "^[A-Z]{2}-\\d{4,6}$", message = "CRO inválido. Formato esperado: SP-12345")
    @Column(name = "CRO", nullable = false, unique = true)
    private String cro;
}