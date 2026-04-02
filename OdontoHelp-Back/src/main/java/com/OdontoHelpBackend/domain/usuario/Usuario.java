package com.OdontoHelpBackend.domain.usuario;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.hibernate.validator.constraints.br.CPF;
import java.time.LocalDate;

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
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;

    @Column(name = "TELEFONE", nullable = false, length = 15)
    private String telefone;

    @Email(message = "E-mail inválido")
    @Column(name = "EMAIL", unique = true, length = 100)
    private String email;

    @Column(name = "SENHA")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    @CPF(message = "CPF inválido")
    @Column(name = "CPF", unique = true, length = 11)
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

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Endereco endereco;

    @PrePersist
    @PreUpdate
    private void limparMascaras() {
        if (this.cpf != null) {
            this.cpf = this.cpf.replaceAll("\\D", "");
        }

        if (this.telefone != null) {
            this.telefone = this.telefone.replaceAll("\\D", "");
        }

        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }

        if (this.nome != null) {
            this.nome = this.nome.trim().toUpperCase();
        }

        if (this.genero != null) {
            this.genero = this.genero.trim().toUpperCase();
        }
    }
}
