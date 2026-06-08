package br.com.odontohelp.fiscal.config;

import br.com.odontohelp.fiscal.dto.ErroResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String ATTR_TENANT_ID = "fiscal.tenantId";

    private final JwtService jwtService;
    private final JwtBlacklistService jwtBlacklistService;
    private final ObjectMapper objectMapper;

    public JwtAuthFilter(JwtService jwtService,
                         JwtBlacklistService jwtBlacklistService,
                         ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.jwtBlacklistService = jwtBlacklistService;
        this.objectMapper = objectMapper;
    }

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
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extrairBearerToken(request);
        if (token == null || !jwtService.tokenValido(token) || jwtBlacklistService.estaBloqueado(token)) {
            responderNaoAutorizado(request, response);
            return;
        }

        jwtService.extrairTenantId(token).ifPresent(tenantId ->
                request.setAttribute(ATTR_TENANT_ID, tenantId));

        filterChain.doFilter(request, response);
    }

    private String extrairBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }

    private void responderNaoAutorizado(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader("WWW-Authenticate", "Bearer");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErroResponse erro = new ErroResponse(
                Instant.now(),
                HttpServletResponse.SC_UNAUTHORIZED,
                "Unauthorized",
                "Token Bearer invalido ou ausente",
                request.getRequestURI()
        );
        objectMapper.writeValue(response.getOutputStream(), erro);
    }
}
