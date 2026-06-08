package com.OdontoHelpFinanceiro.repository;

import com.OdontoHelpFinanceiro.domain.Cobranca;
import com.OdontoHelpFinanceiro.domain.enums.OrigemCobranca;
import com.OdontoHelpFinanceiro.domain.enums.StatusFinanceiro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface CobrancaRepository extends JpaRepository<Cobranca, Long> {

    Page<Cobranca> findByCliente_PacienteIdExterno(Long pacienteId, Pageable pageable);

    Page<Cobranca> findByStatus(StatusFinanceiro status, Pageable pageable);

    Optional<Cobranca> findByOrigemTipoAndOrigemIdExterno(OrigemCobranca origemTipo, String origemIdExterno);

    @Query("""
            SELECT c FROM Cobranca c
            JOIN c.cliente cl
            WHERE (CAST(:pacienteId AS long) IS NULL OR cl.pacienteIdExterno = :pacienteId)
              AND (CAST(:status AS string) IS NULL OR c.status = :status)
              AND (CAST(:origemTipo AS string) IS NULL OR c.origemTipo = :origemTipo)
              AND (CAST(:dataEmissaoDe AS localdate) IS NULL OR c.dataEmissao >= :dataEmissaoDe)
              AND (CAST(:dataEmissaoAte AS localdate) IS NULL OR c.dataEmissao <= :dataEmissaoAte)
            ORDER BY c.dataEmissao DESC, c.id DESC
            """)
    Page<Cobranca> filtrar(
            @Param("pacienteId") Long pacienteId,
            @Param("status") StatusFinanceiro status,
            @Param("origemTipo") OrigemCobranca origemTipo,
            @Param("dataEmissaoDe") LocalDate dataEmissaoDe,
            @Param("dataEmissaoAte") LocalDate dataEmissaoAte,
            Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(c.saldoTotal), 0) FROM Cobranca c
            WHERE c.status IN ('ABERTA', 'PARCIALMENTE_PAGA', 'VENCIDA')
            """)
    BigDecimal somarSaldoAberto();

    @Query("""
            SELECT COALESCE(SUM(c.saldoTotal), 0) FROM Cobranca c
            WHERE c.status = 'VENCIDA'
            """)
    BigDecimal somarSaldoVencido();

    @Query("""
            SELECT COALESCE(SUM(c.valorPago), 0) FROM Cobranca c
            WHERE c.dataEmissao BETWEEN :inicio AND :fim
            """)
    BigDecimal somarRecebidoNoPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
