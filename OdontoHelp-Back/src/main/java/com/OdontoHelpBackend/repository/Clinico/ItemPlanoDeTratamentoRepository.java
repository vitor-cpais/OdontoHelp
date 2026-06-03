package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPlanoDeTratamentoRepository extends JpaRepository<ItemPlanoDeTratamento, Long> {

    @Query("""
        SELECT i FROM ItemPlanoDeTratamento i
        JOIN i.plano p
        WHERE p.paciente.id = :pacienteId
        AND i.numeroDente = :numeroDente
        AND i.status = :status
    """)
    List<ItemPlanoDeTratamento> findByPacienteIdAndNumeroDenteAndStatus(
            @Param("pacienteId") Long pacienteId,
            @Param("numeroDente") Integer numeroDente,
            @Param("status") StatusItemPlano status
    );

    @Query("""
        SELECT i FROM ItemPlanoDeTratamento i
        JOIN i.plano p
        WHERE p.paciente.id = :pacienteId
        AND i.status = :status
    """)
    List<ItemPlanoDeTratamento> findByPacienteIdAndStatus(
            @Param("pacienteId") Long pacienteId,
            @Param("status") StatusItemPlano status
    );

    @Query("""
        SELECT i FROM ItemPlanoDeTratamento i
        JOIN i.plano p
        WHERE p.paciente.id = :pacienteId
        AND i.numeroDente = :numeroDente
        AND i.procedimento.id = :procedimentoId
        AND i.status = :status
    """)
    List<ItemPlanoDeTratamento> findByPacienteIdAndNumeroDenteAndProcedimentoIdAndStatus(
            @Param("pacienteId") Long pacienteId,
            @Param("numeroDente") Integer numeroDente,
            @Param("procedimentoId") Long procedimentoId,
            @Param("status") StatusItemPlano status
    );
}
