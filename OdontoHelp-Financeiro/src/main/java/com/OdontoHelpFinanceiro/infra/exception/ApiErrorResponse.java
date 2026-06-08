package com.OdontoHelpFinanceiro.infra.exception;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        Map<String, String> fields
) {
    public static ApiErrorResponse of(int status, String error, String message) {
        return new ApiErrorResponse(Instant.now(), status, error, message, null);
    }
}
