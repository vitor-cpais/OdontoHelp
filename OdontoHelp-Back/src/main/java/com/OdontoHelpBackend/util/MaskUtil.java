package com.OdontoHelpBackend.util;

public final class MaskUtil {

    private MaskUtil() {}

    public static String email(String email) {
        if (email == null || email.isBlank()) return "***";
        int at = email.indexOf('@');
        if (at <= 0) return "***";
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() == 1) return local + "***" + domain;
        return local.charAt(0) + "***" + domain;
    }
}
