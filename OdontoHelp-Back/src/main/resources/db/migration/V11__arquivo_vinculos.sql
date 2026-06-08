ALTER TABLE tb_arquivo
    ADD COLUMN numero_dente INTEGER,
    ADD COLUMN principal   BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX uk_arquivo_foto_principal
    ON tb_arquivo (paciente_id)
    WHERE tipo = 'FOTO_PACIENTE' AND principal = TRUE;

CREATE INDEX idx_arquivo_atendimento ON tb_arquivo (atendimento_id);
