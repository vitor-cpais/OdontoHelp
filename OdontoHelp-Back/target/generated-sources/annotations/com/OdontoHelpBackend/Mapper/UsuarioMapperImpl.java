package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-27T04:23:10-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class UsuarioMapperImpl implements UsuarioMapper {

    @Override
    public UsuarioResponseDTO toResponse(Usuario usuario) {
        if ( usuario == null ) {
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
        Boolean isAtivo = null;

        id = usuario.getId();
        nome = usuario.getNome();
        telefone = usuario.getTelefone();
        email = usuario.getEmail();
        cpf = usuario.getCpf();
        perfil = usuario.getPerfil();
        dataNascimento = usuario.getDataNascimento();
        genero = usuario.getGenero();
        isAtivo = usuario.getIsAtivo();

        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO( id, nome, telefone, email, cpf, perfil, dataNascimento, genero, isAtivo );

        return usuarioResponseDTO;
    }

    @Override
    public void updateEntity(UsuarioUpdateDTO dto, Usuario usuario) {
        if ( dto == null ) {
            return;
        }

        usuario.setNome( dto.nome() );
        usuario.setTelefone( dto.telefone() );
        usuario.setGenero( dto.genero() );
        usuario.setDataNascimento( dto.dataNascimento() );
    }
}
