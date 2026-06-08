package com.OdontoHelpBackend.infra.security;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public final class UnauthorizedResponseWriter {

    private UnauthorizedResponseWriter() {}

    public static void write(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader("WWW-Authenticate", "Bearer");
        response.setContentType("application/json");
        response.getWriter().write(String.format(
                "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\"}", message));
    }
}
