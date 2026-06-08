package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.PreNfse;
import com.OdontoHelpFinanceiro.domain.enums.StatusPreNfse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreNfseRepository extends JpaRepository<PreNfse, Long> {
    Page<PreNfse> findByStatus(StatusPreNfse status, Pageable pageable);
}
