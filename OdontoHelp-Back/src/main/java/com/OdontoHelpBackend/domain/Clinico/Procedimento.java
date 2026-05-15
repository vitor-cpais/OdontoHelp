package com.OdontoHelpBackend.domain.Clinico;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "TB_PROCEDIMENTO")
@Getter @Setter @NoArgsConstructor
public class Procedimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorBase;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer duracaoMinutos;

    // Cor hexadecimal para legenda no calendário (#RRGGBB)
    @Column(length = 7)
    private String corLegenda;

    @Column(nullable = false)
    private Boolean isAtivo = true;

    @PrePersist
    @PreUpdate
    private void normalizar() {
        if (this.nome != null) this.nome = this.nome.trim().toUpperCase();
        if (this.corLegenda != null) this.corLegenda = this.corLegenda.trim().toUpperCase();
    }
}
