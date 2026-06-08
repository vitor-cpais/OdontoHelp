package com.OdontoHelpBackend.dto.auth;


public record UsuarioResumoResponse(
        Long id,
        String nome,
        String email,
        String perfil,
        Long dentistaId,
        boolean onboardingConcluido
) {}
