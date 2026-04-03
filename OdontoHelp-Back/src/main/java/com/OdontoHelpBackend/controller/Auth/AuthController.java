package com.OdontoHelpBackend.controller.Auth;


import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.auth.AuthResponse;
import com.OdontoHelpBackend.dto.auth.LoginRequest;
import com.OdontoHelpBackend.dto.auth.RefreshRequest;
import com.OdontoHelpBackend.service.Auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Usuario usuario) {
        authService.logout(usuario.getId());
        return ResponseEntity.noContent().build();
    }
}