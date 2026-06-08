package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.MovimentoFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentoFinanceiroRepository extends JpaRepository<MovimentoFinanceiro, Long> {
}
