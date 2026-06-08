package br.com.odontohelp.fiscal.infra.ratelimit;

import br.com.odontohelp.fiscal.config.JwtService;
import br.com.odontohelp.fiscal.exception.RateLimitExceededException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimitService rateLimitService;
    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/v1/health")
                || path.startsWith("/actuator/health")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String clientIp = resolveClientIp(request);
        try {
            rateLimitService.checkGlobal(clientIp);
            applyUserLimits(request);
        } catch (RateLimitExceededException ex) {
            log.warn("Rate limit excedido: ip={}, path={}", clientIp, request.getRequestURI());
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(ex.getRetryAfterSeconds()));
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\"}", ex.getMessage()));
            return;
        }
        chain.doFilter(request, response);
    }

    private void applyUserLimits(HttpServletRequest request) {
        String userKey = resolveUserKey(request);
        if (userKey == null) {
            return;
        }
        String method = request.getMethod();
        if (HttpMethod.POST.matches(method) && "/v1/notas".equals(request.getRequestURI())) {
            rateLimitService.checkEmissao(userKey);
            rateLimitService.checkMutation(userKey);
        } else if (HttpMethod.GET.matches(method)) {
            rateLimitService.checkRead(userKey);
        } else if (isMutation(method)) {
            rateLimitService.checkMutation(userKey);
        }
    }

    private String resolveUserKey(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7).trim();
        if (!jwtService.tokenValido(token)) {
            return null;
        }
        return jwtService.extrairTenantId(token).orElse("anonymous");
    }

    private static boolean isMutation(String method) {
        return HttpMethod.POST.matches(method) || HttpMethod.PUT.matches(method)
                || HttpMethod.PATCH.matches(method) || HttpMethod.DELETE.matches(method);
    }

    static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
