package com.OdontoHelpBackend.dto.Usuario.Request.Dentista;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record DentistaRequestDTO(

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "Telefone é obrigatório")
        String telefone,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        String senha,

        @NotBlank(message = "CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,

        @NotNull(message = "Perfil é obrigatório")
        PerfilUsuario perfil,

        @NotBlank(message = "CRO é obrigatório")
        @Pattern(regexp = "^[A-Z]{2}-\\d{4,6}$", message = "CRO inválido. Formato esperado: SP-12345")
        String cro,

        @NotNull(message = "Data de nascimento é obrigatória")
        LocalDate dataNascimento,

        String genero
) {}
