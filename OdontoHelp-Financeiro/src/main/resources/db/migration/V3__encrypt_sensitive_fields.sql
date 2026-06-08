ALTER TABLE cliente_financeiro ADD COLUMN IF NOT EXISTS cpf_encrypted VARCHAR(512);
ALTER TABLE cliente_financeiro ADD COLUMN IF NOT EXISTS email_encrypted VARCHAR(512);
ALTER TABLE cliente_financeiro ADD COLUMN IF NOT EXISTS telefone_encrypted VARCHAR(512);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'cliente_financeiro' AND column_name = 'cpf'
    ) THEN
        UPDATE cliente_financeiro SET cpf_encrypted = cpf WHERE cpf_encrypted IS NULL AND cpf IS NOT NULL;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'cliente_financeiro' AND column_name = 'email'
    ) THEN
        UPDATE cliente_financeiro SET email_encrypted = email WHERE email_encrypted IS NULL AND email IS NOT NULL;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'cliente_financeiro' AND column_name = 'telefone'
    ) THEN
        UPDATE cliente_financeiro SET telefone_encrypted = telefone WHERE telefone_encrypted IS NULL AND telefone IS NOT NULL;
    END IF;
END $$;

ALTER TABLE cliente_financeiro DROP COLUMN IF EXISTS cpf;
ALTER TABLE cliente_financeiro DROP COLUMN IF EXISTS email;
ALTER TABLE cliente_financeiro DROP COLUMN IF EXISTS telefone;

ALTER TABLE pre_nfse ADD COLUMN IF NOT EXISTS dados_tomador_json_encrypted TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'pre_nfse' AND column_name = 'dados_tomador_json'
    ) THEN
        UPDATE pre_nfse SET dados_tomador_json_encrypted = dados_tomador_json
        WHERE dados_tomador_json_encrypted IS NULL AND dados_tomador_json IS NOT NULL;
    END IF;
END $$;

ALTER TABLE pre_nfse DROP COLUMN IF EXISTS dados_tomador_json;

ALTER TABLE envio_lembrete_cobranca ADD COLUMN IF NOT EXISTS destino_encrypted VARCHAR(512);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'envio_lembrete_cobranca' AND column_name = 'destino'
    ) THEN
        UPDATE envio_lembrete_cobranca SET destino_encrypted = destino
        WHERE destino_encrypted IS NULL AND destino IS NOT NULL;
    END IF;
END $$;

ALTER TABLE envio_lembrete_cobranca DROP COLUMN IF EXISTS destino;
