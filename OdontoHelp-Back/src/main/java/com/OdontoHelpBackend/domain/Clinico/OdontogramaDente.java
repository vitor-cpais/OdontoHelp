package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TB_ODONTOGRAMA_DENTE")
@Getter
@Setter
@NoArgsConstructor
public class OdontogramaDente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "snapshot_id", nullable = false)
    private OdontogramaSnapshot snapshot;

    @Min(11)
    @Max(48)
    @Column(name = "numero_dente", nullable = false)
    private Integer numeroDente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoDente situacao;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public void vincularSnapshot(OdontogramaSnapshot snapshot) {
        this.snapshot = snapshot;
    }
}
