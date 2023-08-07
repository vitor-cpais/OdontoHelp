package com.OdontoHelp.BackEnd.entities;
import com.OdontoHelp.BackEnd.entities.models.Observacao;
import com.OdontoHelp.BackEnd.entities.models.enums.StatusConsulta;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "tb_consulta")
public class Consulta {

    @Id
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // Outros atributos e métodos relacionados a consulta...


    // Método para adicionar uma observação à lista de observações

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
