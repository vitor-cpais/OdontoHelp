package com.OdontoHelpBackend.domain.Clinico;


import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_HISTORICO_ODONTOGRAMA")
@Getter @Setter @NoArgsConstructor
public class HistoricoOdontograma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    // Numeração FDI: dentes 11-48
    @Min(11) @Max(48)
    @Column(nullable = false)
    private Integer numeroDente;

    // Situação ANTES da mudança (null se é o primeiro registro do dente)
    @Enumerated(EnumType.STRING)
    private SituacaoDente situacaoAnterior;

    // Situação APÓS a mudança
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoDente situacaoNova;

    // Dentista que realizou a mudança
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dentista_id", nullable = false)
    private Dentista dentista;

    // Atendimento que originou a mudança
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private Atendimento atendimento;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    // Imutável — nunca atualizado após criação
    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime registradoEm;
}
