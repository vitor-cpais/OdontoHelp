package com.OdontoHelp.BackEnd.entities;

import com.OdontoHelp.BackEnd.dto.ConsultaDTO;
import com.OdontoHelp.BackEnd.entities.util.enums.StatusConsulta;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_consulta")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "dentista_id")
    private Dentista dentista;

    @Enumerated(EnumType.STRING)
    private StatusConsulta statusConsulta;

    private LocalDateTime dataHoraConsulta;

    // Construtores, getters e setters...

    public ConsultaDTO toConsultaDTO() {
        ConsultaDTO dto = new ConsultaDTO();
        dto.setPacienteNome(this.getPaciente().getName());
        dto.setPacienteIdade(this.getPaciente().getIdade());
        dto.setMedicoNome(this.getDentista().getName());
        dto.setMedicoEspecializacao(String.valueOf(this.getDentista().getEspecializacaoDentista()));
        dto.setDataHoraConsulta(String.valueOf(this.getDataHoraConsulta()));
        dto.setStatusConsulta(this.getStatusConsulta().toString());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Dentista getDentista() {
        return dentista;
    }

    public void setDentista(Dentista dentista) {
        this.dentista = dentista;
    }

    public StatusConsulta getStatusConsulta() {
        return statusConsulta;
    }

    public void setStatusConsulta(StatusConsulta statusConsulta) {
        this.statusConsulta = statusConsulta;
    }

    public LocalDateTime getDataHoraConsulta() {
        return dataHoraConsulta;
    }

    public void setDataHoraConsulta(LocalDateTime dataHoraConsulta) {
        this.dataHoraConsulta = dataHoraConsulta;
    }
}
