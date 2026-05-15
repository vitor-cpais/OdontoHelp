package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TB_ITEM_PLANO_TRATAMENTO")
@Getter @Setter @NoArgsConstructor
public class ItemPlanoDeTratamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plano_id", nullable = false)
    private PlanoDeTratamento plano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedimento_id", nullable = false)
    private Procedimento procedimento;

    // Numeração FDI: dentes 11-48
    @Min(11) @Max(48)
    @Column(nullable = false)
    private Integer numeroDente;

    @Column
    private Integer prioridade = 1; // 1 = alta, 2 = média, 3 = baixa

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusItemPlano status = StatusItemPlano.PENDENTE;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    // Atendimento que realizou este item (preenchido quando status = REALIZADO)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_realizacao_id")
    private Atendimento atendimentoRealizacao;
}
