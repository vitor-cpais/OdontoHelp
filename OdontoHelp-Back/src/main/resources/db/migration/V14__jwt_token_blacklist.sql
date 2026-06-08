CREATE TABLE IF NOT EXISTS tb_jwt_token_blacklist (
    token_hash   VARCHAR(64)  PRIMARY KEY,
    expires_at   TIMESTAMPTZ  NOT NULL,
    criado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jwt_blacklist_expires ON tb_jwt_token_blacklist (expires_at);
