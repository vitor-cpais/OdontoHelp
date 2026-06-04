package com.OdontoHelpBackend.dto.Usuario.Request.Paciente;

import jakarta.validation.constraints.Size;

/** Anamnese: resumo clínico fixo do paciente (coluna observacoes_medicas). */
public record PacienteAnamneseDTO(
        @Size(max = 500, message = "Máximo 500 caracteres")
        String anamnese
) {}
