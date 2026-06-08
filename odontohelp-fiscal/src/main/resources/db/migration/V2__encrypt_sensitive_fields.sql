ALTER TABLE tb_nfse RENAME COLUMN tomador_cpf_cnpj TO tomador_cpf_cnpj_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_email TO tomador_email_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_logradouro TO tomador_logradouro_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_numero TO tomador_numero_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_bairro TO tomador_bairro_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_municipio TO tomador_municipio_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_uf TO tomador_uf_encrypted;
ALTER TABLE tb_nfse RENAME COLUMN tomador_cep TO tomador_cep_encrypted;

ALTER TABLE tb_nfse ALTER COLUMN tomador_cpf_cnpj_encrypted TYPE VARCHAR(512);
ALTER TABLE tb_nfse ALTER COLUMN tomador_email_encrypted TYPE VARCHAR(512);
ALTER TABLE tb_nfse ALTER COLUMN tomador_logradouro_encrypted TYPE VARCHAR(512);
ALTER TABLE tb_nfse ALTER COLUMN tomador_numero_encrypted TYPE VARCHAR(512);
ALTER TABLE tb_nfse ALTER COLUMN tomador_bairro_encrypted TYPE VARCHAR(512);
ALTER TABLE tb_nfse ALTER COLUMN tomador_municipio_encrypted TYPE VARCHAR(512);
ALTER TABLE tb_nfse ALTER COLUMN tomador_uf_encrypted TYPE VARCHAR(16);
ALTER TABLE tb_nfse ALTER COLUMN tomador_cep_encrypted TYPE VARCHAR(512);
