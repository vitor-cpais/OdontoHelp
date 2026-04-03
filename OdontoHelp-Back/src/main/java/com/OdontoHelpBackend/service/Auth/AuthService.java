package com.OdontoHelpBackend.service.Auth;

import com.OdontoHelpBackend.infra.exception.InvalidTokenException;
import com.OdontoHelpBackend.infra.security.token.RefreshToken;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.auth.AuthResponse;
import com.OdontoHelpBackend.dto.auth.LoginRequest;
import com.OdontoHelpBackend.dto.auth.RefreshRequest;
import com.OdontoHelpBackend.dto.auth.UsuarioResumoResponse;
import com.OdontoHelpBackend.infra.security.JwtService;
import com.OdontoHelpBackend.infra.security.token.RefreshTokenRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// service/AuthService.java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!usuario.getIsAtivo())
            throw new BadCredentialsException("Usuário inativo");

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha()))
            throw new BadCredentialsException("Credenciais inválidas");

        return gerarAuthResponse(usuario);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(request.refreshToken())
                .orElseThrow(() -> new InvalidTokenException("Refresh token inválido"));

        if (refreshToken.isRevogado() || refreshToken.isExpirado()) {
            refreshTokenRepository.revogarTodosPorUsuario(
                    refreshToken.getUsuario().getId()
            );
            throw new InvalidTokenException("Sessão expirada, faça login novamente");
        }


        refreshToken.setRevogado(true);
        return gerarAuthResponse(refreshToken.getUsuario());
    }

    @Transactional
    public void logout(Long usuarioId) {
        refreshTokenRepository.revogarTodosPorUsuario(usuarioId);
    }


    private AuthResponse gerarAuthResponse(Usuario usuario) {
        String accessToken = jwtService.gerarAccessToken(usuario);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(jwtService.gerarRefreshToken());
        refreshToken.setUsuario(usuario);
        refreshToken.setExpiresAt(jwtService.refreshTokenExpiresAt());
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                new UsuarioResumoResponse(
                        usuario.getId(),
                        usuario.getNome(),
                        usuario.getEmail(),
                        usuario.getPerfil().name()
                )
        );
    }
}