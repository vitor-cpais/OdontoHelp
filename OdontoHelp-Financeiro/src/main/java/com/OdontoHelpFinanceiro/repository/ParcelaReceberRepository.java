package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.ParcelaReceber;
import com.OdontoHelpFinanceiro.domain.enums.StatusFinanceiro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ParcelaReceberRepository extends JpaRepository<ParcelaReceber, Long> {

    List<ParcelaReceber> findByCobrancaIdOrderByNumeroAsc(Long cobrancaId);

    Page<ParcelaReceber> findByStatus(StatusFinanceiro status, Pageable pageable);

    @Query("""
            SELECT p FROM ParcelaReceber p
            WHERE p.status IN ('ABERTA', 'PARCIALMENTE_PAGA', 'VENCIDA')
              AND p.dataVencimento < :hoje
              AND p.saldo > 0
            ORDER BY p.dataVencimento ASC
            """)
    Page<ParcelaReceber> findInadimplentes(@Param("hoje") LocalDate hoje, Pageable pageable);

    @Query("""
            SELECT p FROM ParcelaReceber p
            JOIN p.cobranca c
            JOIN c.cliente cl
            WHERE p.status IN ('ABERTA', 'PARCIALMENTE_PAGA', 'VENCIDA')
              AND p.dataVencimento < :hoje
              AND p.saldo > 0
              AND (CAST(:pacienteId AS long) IS NULL OR cl.pacienteIdExterno = :pacienteId)
              AND (CAST(:vencimentoDe AS localdate) IS NULL OR p.dataVencimento >= :vencimentoDe)
              AND (CAST(:vencimentoAte AS localdate) IS NULL OR p.dataVencimento <= :vencimentoAte)
            ORDER BY p.dataVencimento ASC
            """)
    Page<ParcelaReceber> findInadimplentesFiltrados(
            @Param("hoje") LocalDate hoje,
            @Param("pacienteId") Long pacienteId,
            @Param("vencimentoDe") LocalDate vencimentoDe,
            @Param("vencimentoAte") LocalDate vencimentoAte,
            Pageable pageable);

    @Query("""
            SELECT p FROM ParcelaReceber p
            JOIN p.cobranca c
            WHERE c.cliente.pacienteIdExterno = :pacienteId
            ORDER BY p.dataVencimento DESC
            """)
    List<ParcelaReceber> findByPacienteId(@Param("pacienteId") Long pacienteId);

    @Query("""
            SELECT COALESCE(SUM(p.saldo), 0) FROM ParcelaReceber p
            WHERE p.saldo > 0
              AND p.status NOT IN ('PAGA', 'CANCELADA')
            """)
    BigDecimal somarSaldoTotalAberto();

    @Query("""
            SELECT COALESCE(SUM(p.saldo), 0) FROM ParcelaReceber p
            WHERE p.status IN ('ABERTA', 'PARCIALMENTE_PAGA', 'VENCIDA')
              AND p.dataVencimento < :hoje
              AND p.saldo > 0
            """)
    BigDecimal somarSaldoInadimplente(@Param("hoje") LocalDate hoje);

    @Query("""
            SELECT COALESCE(SUM(p.saldo), 0) FROM ParcelaReceber p
            WHERE p.saldo > 0
              AND p.status NOT IN ('PAGA', 'CANCELADA')
              AND p.dataVencimento >= :hoje
            """)
    BigDecimal somarPrevisaoRecebimento(@Param("hoje") LocalDate hoje);
}
