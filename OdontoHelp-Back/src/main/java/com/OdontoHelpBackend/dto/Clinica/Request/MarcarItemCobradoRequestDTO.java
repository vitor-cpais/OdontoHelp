package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.constraints.NotNull;

public record MarcarItemCobradoRequestDTO(
        @NotNull Long financeiroCobrancaId
) {}
