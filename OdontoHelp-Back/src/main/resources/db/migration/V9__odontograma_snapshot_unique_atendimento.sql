-- Consolida snapshots duplicados do mesmo atendimento em um único registro.
-- Usa temp table (CTEs não atravessam statements separados no Flyway).

CREATE TEMP TABLE _snapshot_keeper AS
SELECT DISTINCT ON (atendimento_id) id AS keeper_id, atendimento_id
FROM tb_odontograma_snapshot
WHERE atendimento_id IS NOT NULL
ORDER BY atendimento_id, criado_em ASC, id ASC;

UPDATE tb_odontograma_dente kd
SET situacao = ld.situacao,
    observacao = ld.observacao
FROM (
    SELECT DISTINCT ON (k.keeper_id, d.numero_dente)
        k.keeper_id,
        d.numero_dente,
        d.situacao,
        d.observacao
    FROM tb_odontograma_snapshot s
    JOIN _snapshot_keeper k ON k.atendimento_id = s.atendimento_id
    JOIN tb_odontograma_dente d ON d.snapshot_id = s.id
    ORDER BY k.keeper_id, d.numero_dente, s.criado_em DESC, s.id DESC
) ld
WHERE kd.snapshot_id = ld.keeper_id
  AND kd.numero_dente = ld.numero_dente;

INSERT INTO tb_odontograma_dente (snapshot_id, numero_dente, situacao, observacao)
SELECT ld.keeper_id, ld.numero_dente, ld.situacao, ld.observacao
FROM (
    SELECT DISTINCT ON (k.keeper_id, d.numero_dente)
        k.keeper_id,
        d.numero_dente,
        d.situacao,
        d.observacao
    FROM tb_odontograma_snapshot s
    JOIN _snapshot_keeper k ON k.atendimento_id = s.atendimento_id
    JOIN tb_odontograma_dente d ON d.snapshot_id = s.id
    ORDER BY k.keeper_id, d.numero_dente, s.criado_em DESC, s.id DESC
) ld
WHERE NOT EXISTS (
    SELECT 1
    FROM tb_odontograma_dente kd
    WHERE kd.snapshot_id = ld.keeper_id
      AND kd.numero_dente = ld.numero_dente
);

DELETE FROM tb_odontograma_dente
WHERE snapshot_id IN (
    SELECT s.id
    FROM tb_odontograma_snapshot s
    JOIN _snapshot_keeper k ON k.atendimento_id = s.atendimento_id
    WHERE s.id != k.keeper_id
);

DELETE FROM tb_odontograma_snapshot
WHERE id IN (
    SELECT s.id
    FROM tb_odontograma_snapshot s
    JOIN _snapshot_keeper k ON k.atendimento_id = s.atendimento_id
    WHERE s.id != k.keeper_id
);

DROP TABLE _snapshot_keeper;

CREATE UNIQUE INDEX uk_snapshot_atendimento
    ON tb_odontograma_snapshot (atendimento_id)
    WHERE atendimento_id IS NOT NULL;
