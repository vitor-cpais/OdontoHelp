package com.OdontoHelpBackend.dto.auth;


// dto/Usuario/UsuarioResumoResponse.java
public record UsuarioResumoResponse(
        Long id,
        String nome,
        String email,
        String perfil
) {}