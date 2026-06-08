package br.com.odontohelp.fiscal.infra.ratelimit;

import br.com.odontohelp.fiscal.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RateLimitConfig config;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void checkMutation(String userKey) {
        check("mutation:user:" + userKey, config.getMutationsPerUserRequests(), config.getMutationsPerUserWindowMinutes());
    }

    public void checkRead(String userKey) {
        check("read:user:" + userKey, config.getReadsPerUserRequests(), config.getReadsPerUserWindowMinutes());
    }

    public void checkEmissao(String userKey) {
        check("emissao:user:" + userKey, config.getEmissaoPerUserRequests(), config.getEmissaoPerUserWindowMinutes());
    }

    public void checkGlobal(String ip) {
        check("global:ip:" + ip, config.getGlobalPerIpRequests(), config.getGlobalPerIpWindowMinutes());
    }

    private void check(String key, int capacity, int windowMinutes) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(capacity, windowMinutes));
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            long retryAfter = Math.max(1, probe.getNanosToWaitForRefill() / 1_000_000_000);
            throw new RateLimitExceededException(retryAfter);
        }
    }

    private static Bucket newBucket(int capacity, int windowMinutes) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, Duration.ofMinutes(windowMinutes))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
