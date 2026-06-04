package com.OdontoHelpBackend.infra.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
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

    public static ApiErrorResponse withFields(int status, String error, String message, Map<String, String> fields) {
        return new ApiErrorResponse(Instant.now(), status, error, message, fields);
    }
}
