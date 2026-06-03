package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


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

    @Min(11)
    @Max(48)
    @Column(nullable = false)
    private Integer numeroDente;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao_nova", nullable = false)
    private SituacaoDente situacaoNova;

    @Column(columnDefinition = "TEXT")
    private String observacao;



    void vincularAtendimento(Atendimento atendimento) {
        this.atendimento = atendimento;
    }
}
