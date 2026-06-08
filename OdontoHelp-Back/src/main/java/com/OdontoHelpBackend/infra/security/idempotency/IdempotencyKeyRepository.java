package com.OdontoHelpBackend.infra.security.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, String> {

    @Modifying
    @Query("DELETE FROM IdempotencyKey k WHERE k.expiresAt < :now")
    int deleteExpired(LocalDateTime now);
}
