package com.OdontoHelpBackend.domain.Consulta;

import com.OdontoHelpBackend.domain.Consulta.enums.OrigemAgendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "TB_AGENDAMENTO")
@Getter @Setter @NoArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataInicio;

    @Column(nullable = false)
    private LocalDateTime dataFim;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConsulta status;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "dentista_id", nullable = false)
    private Dentista dentista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrigemAgendamento origem = OrigemAgendamento.AGENDADA;

    public static Agendamento criarAvulso(Paciente paciente, Dentista dentista, String observacoes, int duracaoMinutos) {
        LocalDateTime inicio = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        Agendamento agendamento = new Agendamento();
        agendamento.paciente = paciente;
        agendamento.dentista = dentista;
        agendamento.dataInicio = inicio;
        agendamento.dataFim = inicio.plusMinutes(duracaoMinutos);
        agendamento.observacoes = observacoes;
        agendamento.status = StatusConsulta.CONFIRMADO;
        agendamento.origem = OrigemAgendamento.AVULSA;
        return agendamento;
    }
}