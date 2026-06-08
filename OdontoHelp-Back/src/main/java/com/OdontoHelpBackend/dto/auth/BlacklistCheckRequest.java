package com.OdontoHelpBackend.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record BlacklistCheckRequest(
        @NotBlank
        String token
) {}
