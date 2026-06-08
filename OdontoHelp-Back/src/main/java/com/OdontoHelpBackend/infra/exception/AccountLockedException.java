package com.OdontoHelpBackend.infra.exception;

import lombok.Getter;

@Getter
public class AccountLockedException extends RuntimeException {

    private final long retryAfterSeconds;

    public AccountLockedException(long retryAfterSeconds) {
        super("Conta temporariamente bloqueada. Tente novamente em " + retryAfterSeconds + " segundos.");
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
