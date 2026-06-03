package com.OdontoHelpBackend.dto.Usuario.Request.Usuario;

import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record UsuarioRequestDTO (


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

    @Past(message = "A data de nascimento deve ser no passado")
    @NotNull(message = "Data de nascimento é obrigatória")
    LocalDate dataNascimento,

    String genero

) {}


