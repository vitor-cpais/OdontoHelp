package com.OdontoHelpBackend.dto.Usuario.Response.Dentista;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;

import java.time.LocalDate;

public record DentistaResponseDTO(
        Long id,
        String nome,
        String telefone,
        String email,
        String cpf,
        String cro,
        PerfilUsuario perfil,
        LocalDate dataNascimento,
        String genero,
        Boolean isAtivo
) {}