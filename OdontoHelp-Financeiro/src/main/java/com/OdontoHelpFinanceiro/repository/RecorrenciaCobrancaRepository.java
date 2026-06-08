package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.RecorrenciaCobranca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RecorrenciaCobrancaRepository extends JpaRepository<RecorrenciaCobranca, Long> {
    Optional<RecorrenciaCobranca> findByCobrancaId(Long cobrancaId);

    List<RecorrenciaCobranca> findByCobrancaIdIn(Collection<Long> cobrancaIds);

    List<RecorrenciaCobranca> findByAtivaTrueAndProximaGeracaoLessThanEqual(LocalDate data);
}
