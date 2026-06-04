package com.OdontoHelpBackend.dto.Usuario.Request.Paciente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PacienteObservacaoRequestDTO(
        @NotBlank(message = "Texto é obrigatório")
        @Size(max = 1000, message = "Máximo 1000 caracteres")
        String texto
) {}
