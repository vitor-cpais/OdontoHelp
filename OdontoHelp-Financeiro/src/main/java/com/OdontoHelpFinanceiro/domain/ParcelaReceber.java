package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.domain.enums.StatusFinanceiro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parcela_receber")
@Getter
@Setter
@NoArgsConstructor
public class ParcelaReceber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cobranca_id", nullable = false)
    private Cobranca cobranca;

    @Column(nullable = false)
    private Integer numero;

    @Column(name = "valor_original", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorOriginal;

    @Column(name = "valor_desconto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "valor_acrescimo", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorAcrescimo = BigDecimal.ZERO;

    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "valor_pago", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorPago = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldo;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento_total")
    private LocalDate dataPagamentoTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusFinanceiro status = StatusFinanceiro.ABERTA;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    @OneToMany(mappedBy = "parcela", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pagamento> pagamentos = new ArrayList<>();

    public void touch() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
