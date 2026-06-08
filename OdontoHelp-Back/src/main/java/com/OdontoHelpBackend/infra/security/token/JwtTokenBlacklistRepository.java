package com.OdontoHelpBackend.infra.security.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface JwtTokenBlacklistRepository extends JpaRepository<JwtTokenBlacklist, String> {

    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    @Modifying
    @Query("DELETE FROM JwtTokenBlacklist b WHERE b.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
