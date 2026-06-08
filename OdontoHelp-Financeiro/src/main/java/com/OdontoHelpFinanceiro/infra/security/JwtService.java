package com.OdontoHelpFinanceiro.infra.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public boolean tokenValido(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public AuthUser extrairUsuario(String token) {
        Claims claims = getClaims(token);
        String email = claims.getSubject();
        String perfil = claims.get("perfil", String.class);
        Long usuarioId = claims.get("usuarioId", Long.class);
        if (email == null || perfil == null || usuarioId == null) {
            throw new JwtException("Token sem claims obrigatorios");
        }
        return new AuthUser(usuarioId, email, perfil);
    }

    /** Valida JWT_SECRET no startup (>= 256 bits). */
    public void validarChaveSecreta() {
        getSigningKey();
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(resolveKeyBytes(secret));
    }

    private static byte[] resolveKeyBytes(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalStateException("jwt.secret nao configurado");
        }
        String trimmed = raw.trim();
        try {
            byte[] decoded = Decoders.BASE64.decode(trimmed);
            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (Exception ignored) {
            // UTF-8 fallback
        }
        byte[] utf8 = trimmed.getBytes(StandardCharsets.UTF_8);
        if (utf8.length < 32) {
            throw new io.jsonwebtoken.security.WeakKeyException("jwt.secret invalido");
        }
        return utf8;
    }
}
