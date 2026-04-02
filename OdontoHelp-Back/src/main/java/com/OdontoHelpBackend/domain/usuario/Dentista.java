package com.OdontoHelpBackend.domain.usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
@NoArgsConstructor  // Mantém: O Hibernate precisa dele
@AllArgsConstructor // Mantém: Útil para seus testes e construtores
public class Dentista extends Usuario {

    @NotBlank(message = "O CRO é obrigatório.")
    @Pattern(
            regexp = "^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)-\\d{3,8}$",
            message = "CRO inválido. Formato esperado: UF-123456"
    )
    @Column(name = "CRO", nullable = false, unique = true, length = 12)
    private String cro;

    // Essa lógica roda "por fora" dos construtores, direto no ciclo de vida do JPA
    @PrePersist
    @PreUpdate
    private void ajustarDadosCro() {
        if (this.cro != null) {
            this.cro = this.cro.trim().toUpperCase();
        }
    }
}
