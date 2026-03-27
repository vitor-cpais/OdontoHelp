package com.OdontoHelpBackend.dto.Usuario.Response.Paciente;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;

import java.time.LocalDate;

public record PacienteResponseDTO(
        Long id,
        String nome,
        String telefone,
        String email,
        String cpf,
        PerfilUsuario perfil,
        LocalDate dataNascimento,
        String genero,
        String observacoesMedicas,
        Boolean isAtivo
) {}