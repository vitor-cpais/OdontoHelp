package com.OdontoHelpBackend.infra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

@Component
public class InternalServiceAccessFilter extends OncePerRequestFilter {

    private static final String INTERNAL_PREFIX = "/internal/";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith(INTERNAL_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        if (!origemInternaPermitida(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Acesso interno negado\"}"
            );
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean origemInternaPermitida(HttpServletRequest request) {
        if (temHeaderProxyPublico(request)) {
            return false;
        }
        return enderecoRedePrivada(request.getRemoteAddr());
    }

    private boolean temHeaderProxyPublico(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return true;
        }
        String realIp = request.getHeader("X-Real-IP");
        return realIp != null && !realIp.isBlank();
    }

    private boolean enderecoRedePrivada(String remoteAddr) {
        if (remoteAddr == null || remoteAddr.isBlank()) {
            return false;
        }
        String ip = remoteAddr;
        if (ip.startsWith("::ffff:")) {
            ip = ip.substring(7);
        }
        try {
            InetAddress address = InetAddress.getByName(ip);
            return address.isLoopbackAddress()
                    || address.isSiteLocalAddress()
                    || address.isLinkLocalAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }
}
