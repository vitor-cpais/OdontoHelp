package com.OdontoHelpBackend.service.Auth;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.auth.ForgotPasswordRequest;
import com.OdontoHelpBackend.dto.auth.ResetPasswordRequest;
import com.OdontoHelpBackend.infra.exception.InvalidTokenException;
import com.OdontoHelpBackend.infra.security.ratelimit.RateLimitService;
import com.OdontoHelpBackend.infra.security.token.PasswordResetToken;
import com.OdontoHelpBackend.infra.security.token.PasswordResetTokenRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetEmailService passwordResetEmailService;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitService rateLimitService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void solicitar(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        rateLimitService.checkForgotPasswordByEmail(email);
        usuarioRepository.findByEmail(email)
                .filter(usuario -> Boolean.TRUE.equals(usuario.getIsAtivo()))
                .ifPresent(this::criarTokenEEnviar);
    }

    @Transactional
    public void redefinir(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hash(request.token()))
                .orElseThrow(() -> new InvalidTokenException("Token inválido ou expirado"));

        if (resetToken.isUsado() || resetToken.isExpirado()) {
            throw new InvalidTokenException("Token inválido ou expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        resetToken.setUsado(true);
        passwordResetTokenRepository.invalidarAtivosPorUsuario(usuario.getId());
    }

    private void criarTokenEEnviar(Usuario usuario) {
        passwordResetTokenRepository.invalidarAtivosPorUsuario(usuario.getId());

        String token = gerarToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsuario(usuario);
        resetToken.setTokenHash(hash(token));
        resetToken.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        passwordResetTokenRepository.save(resetToken);

        passwordResetEmailService.enviar(usuario, resetLink(token));
    }

    private String resetLink(String token) {
        return frontendUrl.replaceAll("/+$", "") + "/resetar-senha?token=" + token;
    }

    private static String gerarToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}
