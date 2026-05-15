package com.OdontoHelpBackend.infra.security.token;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Blacklist em memória para access tokens revogados (logout).
 *
 * Alternativa mais robusta: Redis (recomendado se o sistema escalar para múltiplas instâncias).
 * Para MVP com instância única, ConcurrentHashMap é suficiente.
 *
 * Limpeza automática a cada 30 minutos para evitar acúmulo de tokens expirados.
 */
@Component
public class TokenBlacklist {

    private final Map<String, Instant> tokensBloqueados = new ConcurrentHashMap<>();

    public void invalidar(String token, Instant expiracao) {
        tokensBloqueados.put(token, expiracao);
    }

    public boolean estaBloqueado(String token) {
        Instant expiracao = tokensBloqueados.get(token);
        if (expiracao == null) return false;
        // Se o token já expirou naturalmente, não precisa checar a blacklist
        if (Instant.now().isAfter(expiracao)) {
            tokensBloqueados.remove(token);
            return false;
        }
        return true;
    }

    // Limpeza automática a cada 30 minutos
    @Scheduled(fixedDelay = 1800000)
    public void limparTokensExpirados() {
        Instant agora = Instant.now();
        tokensBloqueados.entrySet().removeIf(entry -> agora.isAfter(entry.getValue()));
    }
}
