package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.domain.enums.StatusPreNfse;
import com.OdontoHelpFinanceiro.util.SensitiveDataConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pre_nfse")
@Getter
@Setter
@NoArgsConstructor
public class PreNfse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cobranca_id", nullable = false)
    private Cobranca cobranca;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_financeiro_id", nullable = false)
    private ClienteFinanceiro cliente;

    @Column(name = "descricao_servico", nullable = false, length = 500)
    private String descricaoServico;

    @Column(name = "valor_servico", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorServico;

    @Column(name = "codigo_servico", length = 20)
    private String codigoServico;

    @Column(name = "aliquota_iss", precision = 5, scale = 2)
    private BigDecimal aliquotaIss;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPreNfse status = StatusPreNfse.PENDENTE;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "dados_tomador_json_encrypted", columnDefinition = "TEXT")
    private String dadosTomadorJson;

    @Column(name = "numero_nfse", length = 50)
    private String numeroNfse;

    @Column(name = "emitida_em")
    private LocalDateTime emitidaEm;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    public void touch() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
