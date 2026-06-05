ALTER TABLE tb_item_atendimento
    ADD COLUMN valor_cobrado_snapshot NUMERIC(10, 2),
    ADD COLUMN status_cobranca VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    ADD COLUMN financeiro_cobranca_id VARCHAR(100),
    ADD COLUMN cobranca_enviada_em TIMESTAMP;

UPDATE tb_item_atendimento item
SET valor_cobrado_snapshot = procedimento.valor_base
FROM tb_procedimento procedimento
WHERE item.procedimento_id = procedimento.id
  AND item.valor_cobrado_snapshot IS NULL;

ALTER TABLE tb_item_atendimento
    ALTER COLUMN valor_cobrado_snapshot SET NOT NULL;

CREATE INDEX idx_item_atend_status_cobranca ON tb_item_atendimento (status_cobranca);
