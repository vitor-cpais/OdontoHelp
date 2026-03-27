package com.OdontoHelpBackend.dto.Usuario.Response.Usuario;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;

import java.time.LocalDate;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String telefone,
        String email,
        String cpf,
        PerfilUsuario perfil,
        LocalDate dataNascimento,
        String genero,
        Boolean isAtivo
) {}
