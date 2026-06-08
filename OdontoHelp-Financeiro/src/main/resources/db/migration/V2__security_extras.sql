ALTER TABLE pre_nfse ADD COLUMN IF NOT EXISTS numero_nfse VARCHAR(50);
ALTER TABLE pre_nfse ADD COLUMN IF NOT EXISTS emitida_em TIMESTAMP;

CREATE TABLE IF NOT EXISTS idempotencia_pagamento (
    id           BIGSERIAL PRIMARY KEY,
    chave        VARCHAR(200) NOT NULL UNIQUE,
    pagamento_id BIGINT REFERENCES pagamento (id),
    criado_em    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS envio_lembrete_cobranca (
    id           BIGSERIAL PRIMARY KEY,
    parcela_id   BIGINT       NOT NULL REFERENCES parcela_receber (id),
    canal        VARCHAR(20)  NOT NULL,
    destino      VARCHAR(200),
    usuario_id   BIGINT,
    criado_em    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_envio_lembrete_parcela ON envio_lembrete_cobranca (parcela_id, criado_em DESC);
