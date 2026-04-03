package com.OdontoHelpBackend.infra.security.token;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    // revoga todas as sessões de um usuário (logout total)
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revogado = true WHERE r.usuario.id = :usuarioId")
    void revogarTodosPorUsuario(Long usuarioId);
}