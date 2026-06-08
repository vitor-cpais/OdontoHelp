package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.EnvioLembreteCobranca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface EnvioLembreteCobrancaRepository extends JpaRepository<EnvioLembreteCobranca, Long> {
    long countByParcelaIdAndCanalAndCriadoEmAfter(Long parcelaId, String canal, LocalDateTime since);
}
