package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusCobrancaItem;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "TB_ITEM_ATENDIMENTO")
@Getter
@Setter
@NoArgsConstructor
public class ItemAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private Atendimento atendimento;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedimento_id", nullable = false)
    private Procedimento procedimento;

    @Column(name = "valor_cobrado_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorCobradoSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_cobranca", nullable = false, length = 30)
    private StatusCobrancaItem statusCobranca = StatusCobrancaItem.PENDENTE;

    @Column(name = "financeiro_cobranca_id", length = 100)
    private String financeiroCobrancaId;

    @Column(name = "cobranca_enviada_em")
    private LocalDateTime cobrancaEnviadaEm;

    @Min(11)
    @Max(48)
    @Column(nullable = false)
    private Integer numeroDente;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao_nova", nullable = false)
    private SituacaoDente situacaoNova;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public void definirProcedimentoCobravel(Procedimento procedimento) {
        this.procedimento = procedimento;
        this.valorCobradoSnapshot = procedimento.getValorBase();
        this.statusCobranca = StatusCobrancaItem.PENDENTE;
    }

    void vincularAtendimento(Atendimento atendimento) {
        this.atendimento = atendimento;
    }
}
