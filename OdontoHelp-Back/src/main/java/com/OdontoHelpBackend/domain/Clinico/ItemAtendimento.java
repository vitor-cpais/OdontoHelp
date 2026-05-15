package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.FaceDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa um procedimento realizado em um dente específico durante um atendimento.
 * ItemAtendimento nunca existe sem um Atendimento pai.
 */
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

    /**
     * Referência ao Procedimento como OBJETO (não apenas ID).
     * O response DTO expõe id + nome para o frontend.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedimento_id", nullable = false)
    private Procedimento procedimento;

    /** Numeração FDI: dentes 11-48 */
    @Min(11)
    @Max(48)
    @Column(nullable = false)
    private Integer numeroDente;

    @Enumerated(EnumType.STRING)
    private FaceDente face;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoDente situacaoIdentificada;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    // ─── Método de domínio ───────────────────────────────────────────────────

    /**
     * Vincula o item ao seu atendimento pai.
     * Chamado exclusivamente por Atendimento#adicionarItem/substituirItens.
     */
    void vincularAtendimento(Atendimento atendimento) {
        this.atendimento = atendimento;
    }
}
