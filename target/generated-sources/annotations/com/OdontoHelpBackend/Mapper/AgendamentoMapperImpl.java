package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Consulta.Response.Agendamento.AgendamentoResponseDTO;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-02T20:24:29-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class AgendamentoMapperImpl implements AgendamentoMapper {

    @Override
    public Agendamento toEntity(AgendamentoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Agendamento agendamento = new Agendamento();

        agendamento.setDataInicio( dto.dataInicio() );
        agendamento.setDataFim( dto.dataFim() );
        agendamento.setObservacoes( dto.observacoes() );

        return agendamento;
    }

    @Override
    public AgendamentoResponseDTO toResponse(Agendamento agendamento) {
        if ( agendamento == null ) {
            return null;
        }

        Long pacienteId = null;
        String pacienteNome = null;
        Long dentistaId = null;
        String dentistaNome = null;
        Long id = null;
        StatusConsulta status = null;
        LocalDateTime dataInicio = null;
        LocalDateTime dataFim = null;
        String observacoes = null;

        pacienteId = agendamentoPacienteId( agendamento );
        pacienteNome = agendamentoPacienteNome( agendamento );
        dentistaId = agendamentoDentistaId( agendamento );
        dentistaNome = agendamentoDentistaNome( agendamento );
        id = agendamento.getId();
        status = agendamento.getStatus();
        dataInicio = agendamento.getDataInicio();
        dataFim = agendamento.getDataFim();
        observacoes = agendamento.getObservacoes();

        AgendamentoResponseDTO agendamentoResponseDTO = new AgendamentoResponseDTO( id, pacienteId, pacienteNome, dentistaId, dentistaNome, status, dataInicio, dataFim, observacoes );

        return agendamentoResponseDTO;
    }

    @Override
    public void updateEntity(AgendamentoUpdateDTO dto, Agendamento agendamento) {
        if ( dto == null ) {
            return;
        }

        agendamento.setDataInicio( dto.dataInicio() );
        agendamento.setDataFim( dto.dataFim() );
        agendamento.setObservacoes( dto.observacoes() );
    }

    private Long agendamentoPacienteId(Agendamento agendamento) {
        if ( agendamento == null ) {
            return null;
        }
        Paciente paciente = agendamento.getPaciente();
        if ( paciente == null ) {
            return null;
        }
        Long id = paciente.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String agendamentoPacienteNome(Agendamento agendamento) {
        if ( agendamento == null ) {
            return null;
        }
        Paciente paciente = agendamento.getPaciente();
        if ( paciente == null ) {
            return null;
        }
        String nome = paciente.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    private Long agendamentoDentistaId(Agendamento agendamento) {
        if ( agendamento == null ) {
            return null;
        }
        Dentista dentista = agendamento.getDentista();
        if ( dentista == null ) {
            return null;
        }
        Long id = dentista.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String agendamentoDentistaNome(Agendamento agendamento) {
        if ( agendamento == null ) {
            return null;
        }
        Dentista dentista = agendamento.getDentista();
        if ( dentista == null ) {
            return null;
        }
        String nome = dentista.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }
}
