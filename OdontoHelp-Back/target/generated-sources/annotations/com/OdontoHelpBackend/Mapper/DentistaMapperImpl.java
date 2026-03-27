package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-27T04:23:10-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class DentistaMapperImpl implements DentistaMapper {

    @Override
    public Dentista toEntity(DentistaRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Dentista dentista = new Dentista();

        dentista.setNome( dto.nome() );
        dentista.setTelefone( dto.telefone() );
        dentista.setEmail( dto.email() );
        dentista.setCpf( dto.cpf() );
        dentista.setPerfil( dto.perfil() );
        dentista.setGenero( dto.genero() );
        dentista.setDataNascimento( dto.dataNascimento() );
        dentista.setCro( dto.cro() );

        return dentista;
    }

    @Override
    public DentistaResponseDTO toResponse(Dentista dentista) {
        if ( dentista == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String telefone = null;
        String email = null;
        String cpf = null;
        String cro = null;
        PerfilUsuario perfil = null;
        LocalDate dataNascimento = null;
        String genero = null;
        Boolean isAtivo = null;

        id = dentista.getId();
        nome = dentista.getNome();
        telefone = dentista.getTelefone();
        email = dentista.getEmail();
        cpf = dentista.getCpf();
        cro = dentista.getCro();
        perfil = dentista.getPerfil();
        dataNascimento = dentista.getDataNascimento();
        genero = dentista.getGenero();
        isAtivo = dentista.getIsAtivo();

        DentistaResponseDTO dentistaResponseDTO = new DentistaResponseDTO( id, nome, telefone, email, cpf, cro, perfil, dataNascimento, genero, isAtivo );

        return dentistaResponseDTO;
    }

    @Override
    public void updateEntity(DentistaUpdateDTO dto, Dentista dentista) {
        if ( dto == null ) {
            return;
        }

        dentista.setNome( dto.nome() );
        dentista.setTelefone( dto.telefone() );
        dentista.setGenero( dto.genero() );
        dentista.setDataNascimento( dto.dataNascimento() );
        dentista.setCro( dto.cro() );
    }
}
