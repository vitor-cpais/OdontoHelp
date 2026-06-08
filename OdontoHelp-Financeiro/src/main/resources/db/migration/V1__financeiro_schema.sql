CREATE TABLE cliente_financeiro (
    id                  BIGSERIAL PRIMARY KEY,
    paciente_id_externo BIGINT       NOT NULL,
    nome                VARCHAR(255) NOT NULL,
    cpf                 VARCHAR(11),
    email               VARCHAR(255),
    telefone            VARCHAR(30),
    ativo               BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_cliente_paciente ON cliente_financeiro (paciente_id_externo);

CREATE TABLE cobranca (
    id                    BIGSERIAL PRIMARY KEY,
    cliente_financeiro_id BIGINT         NOT NULL REFERENCES cliente_financeiro (id),
    origem_tipo           VARCHAR(30)    NOT NULL,
    origem_id_externo     VARCHAR(100),
    descricao             VARCHAR(500)   NOT NULL,
    valor_bruto           NUMERIC(12, 2) NOT NULL,
    valor_desconto        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    valor_acrescimo       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    valor_total           NUMERIC(12, 2) NOT NULL,
    valor_pago            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    saldo_total           NUMERIC(12, 2) NOT NULL,
    quantidade_parcelas   INT            NOT NULL DEFAULT 1,
    data_emissao          DATE           NOT NULL,
    status                VARCHAR(30)    NOT NULL,
    observacao            TEXT,
    criado_por_usuario_id BIGINT,
    criado_em             TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cobranca_cliente ON cobranca (cliente_financeiro_id);
CREATE INDEX idx_cobranca_status ON cobranca (status);
CREATE INDEX idx_cobranca_origem ON cobranca (origem_tipo, origem_id_externo);

CREATE TABLE parcela_receber (
    id                    BIGSERIAL PRIMARY KEY,
    cobranca_id           BIGINT         NOT NULL REFERENCES cobranca (id),
    numero                INT            NOT NULL,
    valor_original        NUMERIC(12, 2) NOT NULL,
    valor_desconto        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    valor_acrescimo       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    valor_total           NUMERIC(12, 2) NOT NULL,
    valor_pago            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    saldo                 NUMERIC(12, 2) NOT NULL,
    data_vencimento       DATE           NOT NULL,
    data_pagamento_total  DATE,
    status                VARCHAR(30)    NOT NULL,
    observacao            TEXT,
    criado_em             TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP      NOT NULL DEFAULT NOW(),
    UNIQUE (cobranca_id, numero)
);

CREATE INDEX idx_parcela_vencimento ON parcela_receber (data_vencimento, status);
CREATE INDEX idx_parcela_status ON parcela_receber (status);

CREATE TABLE recorrencia_cobranca (
    id               BIGSERIAL PRIMARY KEY,
    cobranca_id      BIGINT         NOT NULL REFERENCES cobranca (id),
    frequencia       VARCHAR(20)    NOT NULL DEFAULT 'MENSAL',
    dia_vencimento   INT            NOT NULL,
    valor_base       NUMERIC(12, 2) NOT NULL,
    data_inicio      DATE           NOT NULL,
    data_fim         DATE,
    proxima_geracao  DATE           NOT NULL,
    ativa            BOOLEAN        NOT NULL DEFAULT TRUE,
    observacao       TEXT,
    criado_em        TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em    TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE pagamento (
    id                      BIGSERIAL PRIMARY KEY,
    parcela_receber_id      BIGINT         NOT NULL REFERENCES parcela_receber (id),
    valor                   NUMERIC(12, 2) NOT NULL,
    data_pagamento          DATE           NOT NULL,
    forma_pagamento         VARCHAR(30)    NOT NULL,
    status                  VARCHAR(20)    NOT NULL DEFAULT 'CONFIRMADO',
    referencia_externa      VARCHAR(100),
    observacao              TEXT,
    registrado_por_usuario_id BIGINT,
    criado_em               TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pagamento_parcela ON pagamento (parcela_receber_id);

CREATE TABLE movimento_financeiro (
    id                 BIGSERIAL PRIMARY KEY,
    cobranca_id        BIGINT REFERENCES cobranca (id),
    parcela_receber_id BIGINT REFERENCES parcela_receber (id),
    pagamento_id       BIGINT REFERENCES pagamento (id),
    tipo               VARCHAR(30)    NOT NULL,
    valor              NUMERIC(12, 2) NOT NULL,
    descricao          VARCHAR(500),
    usuario_id         BIGINT,
    criado_em          TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE pre_nfse (
    id                    BIGSERIAL PRIMARY KEY,
    cobranca_id           BIGINT         NOT NULL REFERENCES cobranca (id),
    cliente_financeiro_id BIGINT         NOT NULL REFERENCES cliente_financeiro (id),
    descricao_servico     VARCHAR(500)   NOT NULL,
    valor_servico         NUMERIC(12, 2) NOT NULL,
    codigo_servico        VARCHAR(20),
    aliquota_iss           NUMERIC(5, 2),
    status                VARCHAR(30)    NOT NULL DEFAULT 'PENDENTE',
    dados_tomador_json    TEXT,
    criado_em             TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pre_nfse_status ON pre_nfse (status);

CREATE TABLE idempotencia_cobranca (
    id                  BIGSERIAL PRIMARY KEY,
    chave               VARCHAR(200) NOT NULL UNIQUE,
    cobranca_id         BIGINT REFERENCES cobranca (id),
    criado_em           TIMESTAMP    NOT NULL DEFAULT NOW()
);
