package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.ClienteFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteFinanceiroRepository extends JpaRepository<ClienteFinanceiro, Long> {
    Optional<ClienteFinanceiro> findByPacienteIdExterno(Long pacienteIdExterno);
}
