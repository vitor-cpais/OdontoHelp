package com.OdontoHelpBackend.infra.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class TokenBlacklist {

    private final JwtTokenBlacklistRepository repository;

    @Transactional
    public void invalidar(String token, Instant expiracao) {
        if (token == null || token.isBlank() || expiracao == null) return;
        String hash = TokenHashUtil.hash(token.trim());
        if (repository.existsById(hash)) return;
        var entry = new JwtTokenBlacklist();
        entry.setTokenHash(hash);
        entry.setExpiresAt(expiracao);
        repository.save(entry);
    }

    @Transactional(readOnly = true)
    public boolean estaBloqueado(String token) {
        if (token == null || token.isBlank()) return false;
        String hash = TokenHashUtil.hash(token.trim());
        return repository.existsByTokenHashAndExpiresAtAfter(hash, Instant.now());
    }

    @Scheduled(fixedDelay = 1800000)
    @Transactional
    public void limparTokensExpirados() {
        repository.deleteExpired(Instant.now());
    }
}
