package com.OdontoHelpFinanceiro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import com.OdontoHelpFinanceiro.service.FinanceiroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class RecorrenciaScheduler {

    private final FinanceiroService financeiroService;

    @Scheduled(cron = "0 0 6 * * *")
    public void gerarParcelasRecorrentes() {
        int n = financeiroService.gerarParcelasRecorrencia();
        if (n > 0) log.info("Geradas {} parcelas recorrentes", n);
    }
}
