package com.OdontoHelpBackend.infra.security.idempotency;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;

    @Value("${app.idempotency.ttl-hours:24}")
    private int ttlHours;

    @Transactional
    public Optional<IdempotencyKey> findValid(String key) {
        cleanupExpired();
        return repository.findById(key)
                .filter(record -> record.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Transactional
    public void save(String key, Long userId, String method, String path, int statusCode, String responseBody) {
        cleanupExpired();

        IdempotencyKey record = new IdempotencyKey();
        record.setIdempotencyKey(key);
        record.setUserId(userId);
        record.setMethod(method);
        record.setPath(path);
        record.setStatusCode(statusCode);
        record.setResponseBody(responseBody);
        record.setCreatedAt(LocalDateTime.now());
        record.setExpiresAt(LocalDateTime.now().plusHours(ttlHours));
        try {
            repository.save(record);
        } catch (DataIntegrityViolationException ex) {
            // corrida entre requisições com a mesma chave
        }
    }

    private void cleanupExpired() {
        repository.deleteExpired(LocalDateTime.now());
    }
}
