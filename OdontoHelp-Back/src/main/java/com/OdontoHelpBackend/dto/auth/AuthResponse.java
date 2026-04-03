package com.OdontoHelpBackend.dto.auth;


public record AuthResponse(
        String accessToken,
        String refreshToken,
        UsuarioResumoResponse usuario
) {}

