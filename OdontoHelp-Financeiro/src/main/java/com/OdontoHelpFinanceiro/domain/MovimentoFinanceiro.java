package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.domain.enums.TipoMovimento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimento_financeiro")
@Getter
@Setter
@NoArgsConstructor
public class MovimentoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cobranca_id")
    private Cobranca cobranca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parcela_receber_id")
    private ParcelaReceber parcela;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pagamento_id")
    private Pagamento pagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoMovimento tipo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(length = 500)
    private String descricao;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
