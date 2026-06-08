-- Repara schema financeiro (colunas *_encrypted). Rode na VPS se financeiro nao subir:
-- docker compose exec -T postgres psql -U odontohelp -d odontohelp -f /docker-entrypoint-initdb.d/repair-financeiro-v3.sql
SET search_path TO financeiro;

ALTER TABLE cliente_financeiro ADD COLUMN IF NOT EXISTS cpf_encrypted VARCHAR(512);
ALTER TABLE cliente_financeiro ADD COLUMN IF NOT EXISTS email_encrypted VARCHAR(512);
ALTER TABLE cliente_financeiro ADD COLUMN IF NOT EXISTS telefone_encrypted VARCHAR(512);

UPDATE cliente_financeiro SET cpf_encrypted = cpf WHERE cpf_encrypted IS NULL AND cpf IS NOT NULL;
UPDATE cliente_financeiro SET email_encrypted = email WHERE email_encrypted IS NULL AND email IS NOT NULL;
UPDATE cliente_financeiro SET telefone_encrypted = telefone WHERE telefone_encrypted IS NULL AND telefone IS NOT NULL;

ALTER TABLE cliente_financeiro DROP COLUMN IF EXISTS cpf;
ALTER TABLE cliente_financeiro DROP COLUMN IF EXISTS email;
ALTER TABLE cliente_financeiro DROP COLUMN IF EXISTS telefone;

ALTER TABLE pre_nfse ADD COLUMN IF NOT EXISTS dados_tomador_json_encrypted TEXT;
UPDATE pre_nfse SET dados_tomador_json_encrypted = dados_tomador_json
WHERE dados_tomador_json_encrypted IS NULL AND dados_tomador_json IS NOT NULL;
ALTER TABLE pre_nfse DROP COLUMN IF EXISTS dados_tomador_json;

ALTER TABLE envio_lembrete_cobranca ADD COLUMN IF NOT EXISTS destino_encrypted VARCHAR(512);
UPDATE envio_lembrete_cobranca SET destino_encrypted = destino
WHERE destino_encrypted IS NULL AND destino IS NOT NULL;
ALTER TABLE envio_lembrete_cobranca DROP COLUMN IF EXISTS destino;
