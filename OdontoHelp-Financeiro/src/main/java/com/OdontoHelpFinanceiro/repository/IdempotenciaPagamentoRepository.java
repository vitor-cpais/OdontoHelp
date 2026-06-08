package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.IdempotenciaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IdempotenciaPagamentoRepository extends JpaRepository<IdempotenciaPagamento, Long> {
    Optional<IdempotenciaPagamento> findByChave(String chave);
}
