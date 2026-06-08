package com.OdontoHelpFinanceiro.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "idempotencia_cobranca")
@Getter
@Setter
@NoArgsConstructor
public class IdempotenciaCobranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String chave;

    @Column(name = "cobranca_id")
    private Long cobrancaId;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
