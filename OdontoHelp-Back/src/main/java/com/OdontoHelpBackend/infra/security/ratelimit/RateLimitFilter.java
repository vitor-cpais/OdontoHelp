package com.OdontoHelpBackend.infra.security.ratelimit;

import com.OdontoHelpBackend.infra.exception.RateLimitExceededException;
import com.OdontoHelpBackend.infra.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimitService rateLimitService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = resolveClientIp(request);

        HttpServletRequest effectiveRequest = request;

        try {
            rateLimitService.checkGlobal(clientIp);
            effectiveRequest = maybeWrapRequest(request, path, method);
            applyEndpointLimits(method, path, clientIp, effectiveRequest);
        } catch (RateLimitExceededException ex) {
            log.warn("Rate limit excedido: ip={}, path={}, method={}", clientIp, path, method);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(ex.getRetryAfterSeconds()));
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\"}",
                    ex.getMessage()
            ));
            return;
        }

        filterChain.doFilter(effectiveRequest, response);
    }

    private void applyEndpointLimits(String method, String path, String clientIp, HttpServletRequest request)
            throws IOException {
        if (HttpMethod.POST.matches(method) && "/auth/login".equals(path)) {
            String email = extractEmail(request);
            rateLimitService.checkAuthLogin(clientIp, email);
            return;
        }

        if (HttpMethod.POST.matches(method)
                && ("/auth/forgot-password".equals(path) || "/auth/refresh".equals(path))) {
            rateLimitService.checkAuthMedium(clientIp);
            return;
        }

        String userKey = resolveUserKey(request);
        if (userKey == null) return;

        if (HttpMethod.GET.matches(method)) {
            rateLimitService.checkRead(userKey);
        } else if (isMutation(method)) {
            rateLimitService.checkMutation(userKey);
        }
    }

    private HttpServletRequest maybeWrapRequest(HttpServletRequest request, String path, String method)
            throws IOException {
        if (!HttpMethod.POST.matches(method)) return request;
        if (!"/auth/login".equals(path) && !"/auth/forgot-password".equals(path)) return request;
        if (request instanceof CachedBodyHttpServletRequest) return request;
        return new CachedBodyHttpServletRequest(request);
    }

    private String extractEmail(HttpServletRequest request) throws IOException {
        HttpServletRequest bodyRequest = request instanceof CachedBodyHttpServletRequest cached
                ? cached
                : new CachedBodyHttpServletRequest(request);
        String body = bodyRequest instanceof CachedBodyHttpServletRequest
                ? ((CachedBodyHttpServletRequest) bodyRequest).getCachedBody()
                : "";
        if (body.isBlank()) return null;
        JsonNode node = objectMapper.readTree(body);
        if (node.hasNonNull("email")) {
            return node.get("email").asText().trim().toLowerCase();
        }
        return null;
    }

    private String resolveUserKey(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return null;
        try {
            return jwtService.extrairEmail(header.substring(7));
        } catch (Exception e) {
            return null;
        }
    }

    private static boolean isMutation(String method) {
        return HttpMethod.POST.matches(method)
                || HttpMethod.PUT.matches(method)
                || HttpMethod.PATCH.matches(method)
                || HttpMethod.DELETE.matches(method);
    }

    static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
