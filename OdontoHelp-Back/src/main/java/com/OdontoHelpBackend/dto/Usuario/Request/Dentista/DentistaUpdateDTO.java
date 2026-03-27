package com.OdontoHelpBackend.dto.Usuario.Request.Dentista;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record DentistaUpdateDTO(

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "Telefone é obrigatório")
        String telefone,

        @NotBlank(message = "CRO é obrigatório")
        @Pattern(regexp = "^[A-Z]{2}-\\d{4,6}$", message = "CRO inválido. Formato esperado: SP-12345")
        String cro,

        @NotNull(message = "Data de nascimento é obrigatória")
        LocalDate dataNascimento,

        String genero
) {}
