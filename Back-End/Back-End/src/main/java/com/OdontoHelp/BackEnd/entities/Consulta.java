package com.OdontoHelp.BackEnd.entities;

import com.OdontoHelp.BackEnd.entities.util.enums.StatusConsulta;
import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_consulta")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dataHoraConsulta;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "dentista_id")
    @JsonIgnore
    private Dentista dentista;

    private StatusConsulta statusConsulta;

    // Construtores, getters e setters...


    public Consulta() {
    }


    public Consulta(Long id, LocalDateTime dataHoraConsulta, Paciente paciente, Dentista dentista, StatusConsulta statusConsulta) {
        this.id = id;
        this.dataHoraConsulta = dataHoraConsulta;
        this.paciente = paciente;
        this.dentista = dentista;
        this.statusConsulta = statusConsulta;
    }

    @Override
    public String toString() {
        return "Consulta{" +
                "Paciente='" + paciente.getName() + "', " +
                "Idade='" + paciente.getIdade() + " anos', " +
                "Médico='" + dentista.getName() + "', " +
                "Especialização='" + dentista.getEspecializacaoDentista() + "', " +
                "Data e Hora da Consulta='" + dataHoraConsulta + "'" +
                '}';
    }

    // Getters e setters...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDataHoraConsulta() {
        return dataHoraConsulta;
    }

    public void setDataHoraConsulta(LocalDateTime dataHoraConsulta) {
        this.dataHoraConsulta = dataHoraConsulta;
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
}
