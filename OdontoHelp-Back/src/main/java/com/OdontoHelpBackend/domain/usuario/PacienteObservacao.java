package com.OdontoHelpBackend.domain.usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_PACIENTE_OBSERVACAO")
@Getter
@Setter
@NoArgsConstructor
public class PacienteObservacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "PACIENTE_ID", nullable = false)
    private Paciente paciente;

    @Column(name = "TEXTO", nullable = false, columnDefinition = "TEXT")
    private String texto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "AUTOR_USUARIO_ID", nullable = false)
    private Usuario autor;

    @Column(name = "CRIADO_EM", nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void prePersist() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public static PacienteObservacao criar(Paciente paciente, Usuario autor, String texto) {
        PacienteObservacao obs = new PacienteObservacao();
        obs.setPaciente(paciente);
        obs.setAutor(autor);
        obs.setTexto(texto.trim());
        return obs;
    }
}
