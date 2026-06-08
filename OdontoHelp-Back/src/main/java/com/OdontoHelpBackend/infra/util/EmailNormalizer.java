package com.OdontoHelpBackend.infra.util;

public final class EmailNormalizer {

    private EmailNormalizer() {}

    public static String normalize(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
