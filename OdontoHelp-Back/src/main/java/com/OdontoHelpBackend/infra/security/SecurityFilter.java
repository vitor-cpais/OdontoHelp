package com.OdontoHelpBackend.infra.security;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.infra.security.token.TokenBlacklist;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SecurityFilter.class);

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final TokenBlacklist tokenBlacklist;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = extrairToken(request);

        if (token != null && !tokenBlacklist.estaBloqueado(token)) {
            try {
                String email = jwtService.extrairEmail(token);

                if (email != null && deveSubstituirAutenticacao()) {
                    usuarioRepository.findByEmail(email).ifPresent(usuario -> {
                        if (Boolean.TRUE.equals(usuario.getIsAtivo())) {
                            var auth = new UsernamePasswordAuthenticationToken(
                                    usuario, null, usuario.getAuthorities()
                            );
                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        }
                    });
                }
            } catch (Exception e) {
                log.debug("Token JWT invalido ou expirado: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Substitui autenticacao anonima padrao do Spring pelo usuario do JWT.
     * Sem isso, hasRole('ADMIN') falha com 403 mesmo com token valido.
     */
    private boolean deveSubstituirAutenticacao() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null
                || !auth.isAuthenticated()
                || auth instanceof AnonymousAuthenticationToken;
    }

    private String extrairToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
