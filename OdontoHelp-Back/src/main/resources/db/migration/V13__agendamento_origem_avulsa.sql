ALTER TABLE tb_agendamento
    ADD COLUMN origem VARCHAR(32) NOT NULL DEFAULT 'AGENDADA';

ALTER TABLE tb_agendamento
    DROP CONSTRAINT ex_agendamento_dentista_horario;

ALTER TABLE tb_agendamento
    ADD CONSTRAINT ex_agendamento_dentista_horario
    EXCLUDE USING gist (
        dentista_id WITH =,
        tsrange(data_inicio, data_fim) WITH &&
    ) WHERE (status <> 'CANCELADO' AND origem <> 'AVULSA');
