package com.OdontoHelpBackend.infra.security.idempotency;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_IDEMPOTENCY_KEY")
@Getter
@Setter
@NoArgsConstructor
public class IdempotencyKey {

    @Id
    @Column(name = "IDEMPOTENCY_KEY", length = 64)
    private String idempotencyKey;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "METHOD", nullable = false, length = 10)
    private String method;

    @Column(name = "PATH", nullable = false, length = 255)
    private String path;

    @Column(name = "STATUS_CODE", nullable = false)
    private Integer statusCode;

    @Column(name = "RESPONSE_BODY", nullable = false, columnDefinition = "TEXT")
    private String responseBody;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;
}
