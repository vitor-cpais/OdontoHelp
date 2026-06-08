package com.OdontoHelpFinanceiro.infra.security;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioAtivoService {

    private final JdbcTemplate jdbcTemplate;

    public boolean isAtivo(Long usuarioId) {
        if (usuarioId == null) {
            return false;
        }
        Boolean ativo = jdbcTemplate.query(
                """
                SELECT is_ativo FROM public.tb_usuario
                WHERE id = ?
                LIMIT 1
                """,
                rs -> rs.next() ? rs.getBoolean(1) : null,
                usuarioId);
        return Boolean.TRUE.equals(ativo);
    }
}
