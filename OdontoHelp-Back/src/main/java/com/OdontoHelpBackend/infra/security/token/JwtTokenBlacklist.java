package com.OdontoHelpBackend.infra.security.token;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "TB_JWT_TOKEN_BLACKLIST")
@Getter
@Setter
@NoArgsConstructor
public class JwtTokenBlacklist {

    @Id
    @Column(name = "TOKEN_HASH", length = 64)
    private String tokenHash;

    @Column(name = "EXPIRES_AT", nullable = false)
    private Instant expiresAt;

    @Column(name = "CRIADO_EM", nullable = false)
    private Instant criadoEm = Instant.now();
}
