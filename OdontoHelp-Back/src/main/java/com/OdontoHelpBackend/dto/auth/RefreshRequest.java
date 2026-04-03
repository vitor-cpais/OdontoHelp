package com.OdontoHelpBackend.dto.auth;


import jakarta.validation.constraints.NotBlank;


public record RefreshRequest(
        @NotBlank
        String refreshToken
) {}

