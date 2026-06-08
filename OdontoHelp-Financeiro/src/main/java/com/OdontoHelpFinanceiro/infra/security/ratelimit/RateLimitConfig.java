package com.OdontoHelpFinanceiro.infra.security.ratelimit;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitConfig {

    private int mutationsPerUserRequests = 60;
    private int mutationsPerUserWindowMinutes = 1;
    private int readsPerUserRequests = 300;
    private int readsPerUserWindowMinutes = 1;
    private int globalPerIpRequests = 200;
    private int globalPerIpWindowMinutes = 1;
}
