CREATE TABLE tb_idempotency_key (
    idempotency_key VARCHAR(64) PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    method          VARCHAR(10)  NOT NULL,
    path            VARCHAR(255) NOT NULL,
    status_code     INT          NOT NULL,
    response_body   TEXT         NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP    NOT NULL
);

CREATE INDEX idx_idempotency_expires ON tb_idempotency_key (expires_at);
