package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-02T20:24:29-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class PacienteMapperImpl implements PacienteMapper {

    @Override
    public Paciente toEntity(PacienteRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Paciente paciente = new Paciente();

        paciente.setNome( dto.nome() );
        paciente.setTelefone( dto.telefone() );
        paciente.setEmail( dto.email() );
        paciente.setCpf( dto.cpf() );
        paciente.setPerfil( dto.perfil() );
        paciente.setGenero( dto.genero() );
        paciente.setDataNascimento( dto.dataNascimento() );
        paciente.setObservacoesMedicas( dto.observacoesMedicas() );

        return paciente;
    }

    @Override
    public PacienteResponseDTO toResponse(Paciente paciente) {
        if ( paciente == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String telefone = null;
        String email = null;
        String cpf = null;
        PerfilUsuario perfil = null;
        LocalDate dataNascimento = null;
        String genero = null;
        String observacoesMedicas = null;
        Boolean isAtivo = null;

        id = paciente.getId();
        nome = paciente.getNome();
        telefone = paciente.getTelefone();
        email = paciente.getEmail();
        cpf = paciente.getCpf();
        perfil = paciente.getPerfil();
        dataNascimento = paciente.getDataNascimento();
        genero = paciente.getGenero();
        observacoesMedicas = paciente.getObservacoesMedicas();
        isAtivo = paciente.getIsAtivo();

        PacienteResponseDTO pacienteResponseDTO = new PacienteResponseDTO( id, nome, telefone, email, cpf, perfil, dataNascimento, genero, observacoesMedicas, isAtivo );

        return pacienteResponseDTO;
    }

    @Override
    public void updateEntity(PacienteUpdateDTO dto, Paciente paciente) {
        if ( dto == null ) {
            return;
        }

        paciente.setNome( dto.nome() );
        paciente.setTelefone( dto.telefone() );
        paciente.setGenero( dto.genero() );
        paciente.setDataNascimento( dto.dataNascimento() );
        paciente.setObservacoesMedicas( dto.observacoesMedicas() );
    }
}
