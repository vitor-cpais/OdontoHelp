package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.domain.enums.OrigemCobranca;
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
@Table(name = "cobranca")
@Getter
@Setter
@NoArgsConstructor
public class Cobranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_financeiro_id", nullable = false)
    private ClienteFinanceiro cliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem_tipo", nullable = false, length = 30)
    private OrigemCobranca origemTipo = OrigemCobranca.MANUAL;

    @Column(name = "origem_id_externo", length = 100)
    private String origemIdExterno;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(name = "valor_bruto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorBruto;

    @Column(name = "valor_desconto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "valor_acrescimo", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorAcrescimo = BigDecimal.ZERO;

    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "valor_pago", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorPago = BigDecimal.ZERO;

    @Column(name = "saldo_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoTotal;

    @Column(name = "quantidade_parcelas", nullable = false)
    private Integer quantidadeParcelas = 1;

    @Column(name = "data_emissao", nullable = false)
    private LocalDate dataEmissao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusFinanceiro status = StatusFinanceiro.ABERTA;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "criado_por_usuario_id")
    private Long criadoPorUsuarioId;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    @OneToMany(mappedBy = "cobranca", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParcelaReceber> parcelas = new ArrayList<>();

    public void touch() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
