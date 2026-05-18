package com.OdontoHelpBackend.dto.Usuario.Request.Paciente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record PacienteUpdateDTO(

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "Telefone é obrigatório")
        String telefone,

        @NotNull(message = "Data de nascimento é obrigatória")
        LocalDate dataNascimento,

        String genero,

        String observacoesMedicas,

        @Email(message = "E-mail inválido")
        String email,

        String senha,

        @NotBlank(message = "CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf
) {}