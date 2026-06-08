CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE tb_agendamento
    ADD CONSTRAINT ex_agendamento_dentista_horario
    EXCLUDE USING gist (
        dentista_id WITH =,
        tsrange(data_inicio, data_fim) WITH &&
    ) WHERE (status <> 'CANCELADO');
