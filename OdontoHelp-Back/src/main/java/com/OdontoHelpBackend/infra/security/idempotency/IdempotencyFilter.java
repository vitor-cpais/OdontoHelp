package com.OdontoHelpBackend.infra.security.idempotency;

import com.OdontoHelpBackend.infra.security.JwtService;
import com.OdontoHelpBackend.infra.security.ratelimit.CachedBodyHttpServletRequest;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final String HEADER = "Idempotency-Key";
    private static final Set<String> MUTATION_METHODS = Set.of("POST", "PUT", "PATCH");
    private static final Pattern INICIAR_ATENDIMENTO = Pattern.compile("^/agendamentos/\\d+/iniciar-atendimento$");

    private final IdempotencyService idempotencyService;
    private final JwtService jwtService;
    private final ConcurrentHashMap<String, Object> inFlightLocks = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String idempotencyKey = request.getHeader(HEADER);
        if (idempotencyKey == null || idempotencyKey.isBlank() || !isEligible(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String normalizedKey = idempotencyKey.trim();
        Object lock = inFlightLocks.computeIfAbsent(normalizedKey, k -> new Object());
        synchronized (lock) {
            try {
                var cached = idempotencyService.findValid(normalizedKey);
                if (cached.isPresent()) {
                    writeCachedResponse(response, cached.get());
                    return;
                }

                HttpServletRequest effectiveRequest = request;
                if (!(request instanceof CachedBodyHttpServletRequest)) {
                    effectiveRequest = new CachedBodyHttpServletRequest(request);
                }

                ContentCachingResponseWrapper cachingResponse = new ContentCachingResponseWrapper(response);
                filterChain.doFilter(effectiveRequest, cachingResponse);

                byte[] responseBody = cachingResponse.getContentAsByteArray();
                String body = new String(responseBody, cachingResponse.getCharacterEncoding());

                idempotencyService.save(
                        normalizedKey,
                        resolveUserId(request),
                        request.getMethod(),
                        request.getRequestURI(),
                        cachingResponse.getStatus(),
                        body
                );

                cachingResponse.copyBodyToResponse();
            } finally {
                inFlightLocks.remove(normalizedKey);
            }
        }
    }

    private void writeCachedResponse(HttpServletResponse response, IdempotencyKey record) throws IOException {
        response.setStatus(record.getStatusCode());
        response.setContentType("application/json");
        response.getWriter().write(record.getResponseBody());
    }

    private boolean isEligible(HttpServletRequest request) {
        if (!MUTATION_METHODS.contains(request.getMethod())) return false;
        String path = request.getRequestURI();
        if (HttpMethod.POST.matches(request.getMethod()) && "/auth/login".equals(path)) return true;
        if (HttpMethod.POST.matches(request.getMethod()) && "/agendamentos".equals(path)) return true;
        return HttpMethod.POST.matches(request.getMethod()) && INICIAR_ATENDIMENTO.matcher(path).matches();
    }

    private Long resolveUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return 0L;
        try {
            return jwtService.extrairUserId(header.substring(7));
        } catch (Exception e) {
            return 0L;
        }
    }
}
