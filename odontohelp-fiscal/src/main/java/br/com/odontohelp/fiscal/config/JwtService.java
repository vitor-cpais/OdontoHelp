package br.com.odontohelp.fiscal.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public boolean tokenValido(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public Optional<String> extrairTenantId(String token) {
        Claims claims = parseClaims(token);
        String tenantId = claims.get("tenantId", String.class);
        if (tenantId == null || tenantId.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(tenantId.trim());
    }

    /** Valida JWT_SECRET no startup (>= 256 bits). */
    public void validarChaveSecreta() {
        signingKey();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey signingKey() {
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
