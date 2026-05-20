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

    @Min(11) @Max(48)
    @Column(nullable = false)
    private Integer numeroDente;

    @Enumerated(EnumType.STRING)
    private SituacaoDente situacaoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoDente situacaoNova;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dentista_id", nullable = false)
    private Dentista dentista;

    // Nullable — pode ser null quando a atualização é feita diretamente (sem atendimento formal)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_id", nullable = true)
    private Atendimento atendimento;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime registradoEm;
}
