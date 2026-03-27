package com.OdontoHelpBackend.domain.usuario;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.validator.constraints.br.CPF;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TB_USUARIO")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Column(name = "NOME", nullable = false)
    private String nome;

    @Column(name = "TELEFONE", nullable = false)
    private String telefone;

    @Column(name = "EMAIL", unique = true)
    private String email;

    @Column(name = "SENHA")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    @CPF
    @Column(name = "CPF", unique = true)
    private String cpf;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERFIL", nullable = false)
    private PerfilUsuario perfil;

    @Column(name = "IS_ATIVO", nullable = false)
    private Boolean isAtivo = true;

    @Column(name = "GENERO")
    private String genero;

    @Column(name = "DATA_NASCIMENTO")
    private LocalDate dataNascimento;
}

