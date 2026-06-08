package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.domain.enums.FrequenciaRecorrencia;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recorrencia_cobranca")
@Getter
@Setter
@NoArgsConstructor
public class RecorrenciaCobranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cobranca_id", nullable = false)
    private Cobranca cobranca;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FrequenciaRecorrencia frequencia = FrequenciaRecorrencia.MENSAL;

    @Column(name = "dia_vencimento", nullable = false)
    private Integer diaVencimento;

    @Column(name = "valor_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorBase;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "proxima_geracao", nullable = false)
    private LocalDate proximaGeracao;

    @Column(nullable = false)
    private Boolean ativa = true;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    public void touch() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
