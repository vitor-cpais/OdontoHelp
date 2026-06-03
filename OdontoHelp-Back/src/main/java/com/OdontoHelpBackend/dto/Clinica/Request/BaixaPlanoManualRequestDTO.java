package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BaixaPlanoManualRequestDTO(
        @NotEmpty List<Long> itemPlanoIds
) {}
