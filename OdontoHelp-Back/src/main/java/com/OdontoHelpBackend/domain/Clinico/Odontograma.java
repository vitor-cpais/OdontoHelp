package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "TB_ODONTOGRAMA",
    uniqueConstraints = @UniqueConstraint(columnNames = {"paciente_id", "numero_dente"})
)
@Getter @Setter @NoArgsConstructor
public class Odontograma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    // Numeração FDI: dentes 11-48
    @Min(11) @Max(48)
    @Column(name = "numero_dente", nullable = false)
    private Integer numeroDente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoDente situacaoAtual = SituacaoDente.SAUDAVEL;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;
}
