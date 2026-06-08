package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.Pagamento;
import com.OdontoHelpFinanceiro.domain.enums.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    List<Pagamento> findByParcelaIdOrderByCriadoEmDesc(Long parcelaId);

    @Query("""
            SELECT p FROM Pagamento p
            JOIN FETCH p.parcela par
            JOIN FETCH par.cobranca c
            JOIN FETCH c.cliente
            WHERE p.id = :id
            """)
    java.util.Optional<Pagamento> findByIdComDetalhes(@Param("id") Long id);

    @Query("""
            SELECT COALESCE(SUM(p.valor), 0) FROM Pagamento p
            WHERE p.status = :status
              AND p.dataPagamento BETWEEN :inicio AND :fim
            """)
    BigDecimal somarRecebidoNoPeriodo(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("status") StatusPagamento status);
}
