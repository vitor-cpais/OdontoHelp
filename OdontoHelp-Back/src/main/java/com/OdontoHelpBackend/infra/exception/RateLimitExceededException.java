package com.OdontoHelpBackend.infra.exception;

import lombok.Getter;

@Getter
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(long retryAfterSeconds) {
        super("Muitas tentativas. Tente novamente em " + retryAfterSeconds + " segundos.");
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
