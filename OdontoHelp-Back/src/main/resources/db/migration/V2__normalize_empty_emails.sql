-- E-mails vazios violam UNIQUE e a validação de duplicidade; paciente sem login usa NULL.
UPDATE tb_usuario SET email = NULL WHERE email IS NOT NULL AND TRIM(email) = '';
