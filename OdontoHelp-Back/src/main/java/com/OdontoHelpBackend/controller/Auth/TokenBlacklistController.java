package com.OdontoHelpBackend.controller.Auth;

import com.OdontoHelpBackend.dto.auth.BlacklistCheckRequest;
import com.OdontoHelpBackend.dto.auth.BlacklistCheckResponse;
import com.OdontoHelpBackend.infra.security.token.TokenBlacklist;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/auth/token/blacklist")
@RequiredArgsConstructor
public class TokenBlacklistController {

    private final TokenBlacklist tokenBlacklist;

    @PostMapping("/check")
    public ResponseEntity<BlacklistCheckResponse> check(@RequestBody @Valid BlacklistCheckRequest request) {
        boolean blacklisted = tokenBlacklist.estaBloqueado(request.token());
        return ResponseEntity.ok(new BlacklistCheckResponse(blacklisted));
    }
}
