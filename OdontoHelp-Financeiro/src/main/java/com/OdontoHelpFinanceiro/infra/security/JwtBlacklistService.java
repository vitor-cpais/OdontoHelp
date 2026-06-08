package com.OdontoHelpFinanceiro.infra.security;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class JwtBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(JwtBlacklistService.class);

    @Value("${core.blacklist-url}")
    private String blacklistUrl;

    public boolean estaBloqueado(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            BlacklistCheckResponse response = RestClient.create()
                    .post()
                    .uri(blacklistUrl)
                    .body(new BlacklistCheckRequest(token.trim()))
                    .retrieve()
                    .body(BlacklistCheckResponse.class);
            return response != null && response.blacklisted();
        } catch (Exception ex) {
            log.warn("Falha ao consultar blacklist do Core ({}): {}", blacklistUrl, ex.getMessage());
            return false;
        }
    }

    private record BlacklistCheckRequest(String token) {
    }

    private record BlacklistCheckResponse(boolean blacklisted) {
    }
}
