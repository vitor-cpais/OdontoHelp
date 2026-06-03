package com.OdontoHelpBackend.dto.Usuario.Request.Usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record UsuarioUpdateDTO(

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "Telefone é obrigatório")
        String telefone,

        @Past(message = "A data de nascimento deve ser no passado")
        @NotNull(message = "Data de nascimento é obrigatória")
        LocalDate dataNascimento,

        String genero
) {}
