CREATE TABLE tb_nfse (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            VARCHAR(50)  NOT NULL,
    external_charge_id   VARCHAR(100) NOT NULL,
    external_customer_id VARCHAR(100) NOT NULL,
    valor                NUMERIC(15,2) NOT NULL,
    descricao_servico    TEXT NOT NULL,
    status               VARCHAR(30)  NOT NULL DEFAULT 'PENDENTE',
    nfse_numero          VARCHAR(50),
    mensagem_erro        TEXT,
    modo_emissao         VARCHAR(20)  NOT NULL,
    tomador_nome         VARCHAR(255) NOT NULL,
    tomador_cpf_cnpj     VARCHAR(14),
    tomador_email        VARCHAR(255),
    tomador_logradouro   VARCHAR(255),
    tomador_numero       VARCHAR(20),
    tomador_bairro       VARCHAR(100),
    tomador_municipio    VARCHAR(100),
    tomador_uf           CHAR(2),
    tomador_cep          VARCHAR(8),
    criado_em            TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nfse_tenant_id ON tb_nfse(tenant_id);
CREATE INDEX idx_nfse_status ON tb_nfse(tenant_id, status);
CREATE INDEX idx_nfse_external_charge ON tb_nfse(tenant_id, external_charge_id);
