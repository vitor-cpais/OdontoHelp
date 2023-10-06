package com.OdontoHelp.BackEnd.dto;

import com.OdontoHelp.BackEnd.entities.Consulta;
import com.OdontoHelp.BackEnd.entities.util.enums.EspecializacaoDentista;
import com.OdontoHelp.BackEnd.entities.util.enums.StatusConsulta;

import java.time.LocalDateTime;

public class ConsultaDTO {
    private String pacienteNome;
    private int pacienteIdade;
    private String medicoNome;
    private String medicoEspecializacao;
    private String dataHoraConsulta;
    private String statusConsulta;

    public ConsultaDTO() {
    }

    public ConsultaDTO(String pacienteNome, int pacienteIdade, String medicoNome, String medicoEspecializacao,
                       String dataHoraConsulta, String statusConsulta) {
        this.pacienteNome = pacienteNome;
        this.pacienteIdade = pacienteIdade;
        this.medicoNome = medicoNome;
        this.medicoEspecializacao = medicoEspecializacao;
        this.dataHoraConsulta = dataHoraConsulta;
        this.statusConsulta = statusConsulta;
    }

    public static ConsultaDTO fromEntity(Consulta consulta) {
        ConsultaDTO dto = new ConsultaDTO();
        dto.setPacienteNome(consulta.getPaciente().getName());
        dto.setPacienteIdade(consulta.getPaciente().getIdade());
        dto.setMedicoNome(consulta.getDentista().getName());
        dto.setMedicoEspecializacao(String.valueOf(consulta.getDentista().getEspecializacaoDentista()));
        dto.setDataHoraConsulta(String.valueOf(consulta.getDataHoraConsulta()));
        dto.setStatusConsulta(consulta.getStatusConsulta().toString());
        return dto;
    }

    public Consulta toEntity() {
        Consulta consulta = new Consulta();
        consulta.getPaciente().setName(this.getPacienteNome());
        consulta.getPaciente().getIdade();
        consulta.getDentista().setName(this.getMedicoNome());
        consulta.getDentista().setEspecializacaoDentista(EspecializacaoDentista.valueOf(this.getMedicoEspecializacao()));
        consulta.setDataHoraConsulta(LocalDateTime.parse(this.getDataHoraConsulta()));
        consulta.setStatusConsulta(StatusConsulta.valueOf(this.getStatusConsulta()));
        return consulta;
    }

    @Override
    public String toString() {
        return "ConsultaDTO{" +
                "pacienteNome='" + pacienteNome + '\'' +
                ", pacienteIdade=" + pacienteIdade +
                ", medicoNome='" + medicoNome + '\'' +
                ", medicoEspecializacao='" + medicoEspecializacao + '\'' +
                ", dataHoraConsulta='" + dataHoraConsulta + '\'' +
                ", statusConsulta='" + statusConsulta + '\'' +
                '}';
    }

    public String getPacienteNome() {
        return pacienteNome;
    }

    public void setPacienteNome(String pacienteNome) {
        this.pacienteNome = pacienteNome;
    }

    public int getPacienteIdade() {
        return pacienteIdade;
    }

    public void setPacienteIdade(int pacienteIdade) {
        this.pacienteIdade = pacienteIdade;
    }

    public String getMedicoNome() {
        return medicoNome;
    }

    public void setMedicoNome(String medicoNome) {
        this.medicoNome = medicoNome;
    }

    public String getMedicoEspecializacao() {
        return medicoEspecializacao;
    }

    public void setMedicoEspecializacao(String medicoEspecializacao) {
        this.medicoEspecializacao = medicoEspecializacao;
    }

    public String getDataHoraConsulta() {
        return dataHoraConsulta;
    }

    public void setDataHoraConsulta(String dataHoraConsulta) {
        this.dataHoraConsulta = dataHoraConsulta;
    }

    public String getStatusConsulta() {
        return statusConsulta;
    }

    public void setStatusConsulta(String statusConsulta) {
        this.statusConsulta = statusConsulta;
    }
}
