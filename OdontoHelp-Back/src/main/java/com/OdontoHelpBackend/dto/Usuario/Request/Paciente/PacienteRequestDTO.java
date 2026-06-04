package com.OdontoHelpBackend.dto.Usuario.Request.Paciente;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record PacienteRequestDTO(

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "Telefone é obrigatório")
        String telefone,


        /** Opcional — paciente não precisa de login no momento. */
        String email,


        String senha,

        @NotBlank(message = "CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,

        @NotNull(message = "Perfil é obrigatório")
        PerfilUsuario perfil,

        @Past(message = "A data de nascimento deve ser no passado")
        @NotNull(message = "Data de nascimento é obrigatória")
        LocalDate dataNascimento,

        String genero,

        String observacoesMedicas
) {}
