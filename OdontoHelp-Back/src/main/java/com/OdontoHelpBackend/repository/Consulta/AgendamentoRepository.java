package com.OdontoHelpBackend.repository.Consulta;

import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    Slice<Agendamento> findByPacienteId(Long pacienteId, Pageable pageable);

    Slice<Agendamento> findByDentistaId(Long dentistaId, Pageable pageable);

    Slice<Agendamento> findByStatus(StatusConsulta status, Pageable pageable);

    boolean existsByDentistaIdAndStatusNotAndDataInicioLessThanAndDataFimGreaterThan(
            Long dentistaId,
            StatusConsulta status,
            LocalDateTime dataFim,
            LocalDateTime dataInicio
    );

    @Query("""
                SELECT a FROM Agendamento a
                WHERE (:dataInicio IS NULL OR a.dataInicio >= :dataInicio)
                AND (:dataFim IS NULL OR a.dataFim <= :dataFim)
                AND (:status IS NULL OR a.status = :status)
                AND (:dentistaId IS NULL OR a.dentista.id = :dentistaId)
                AND (:pacienteId IS NULL OR a.paciente.id = :pacienteId)
            """)
    Slice<Agendamento> filtrar(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            @Param("status") StatusConsulta status,
            @Param("dentistaId") Long dentistaId,
            @Param("pacienteId") Long pacienteId,
            Pageable pageable
    );

    @Query("""
                SELECT COUNT(a) FROM Agendamento a
                WHERE a.dataInicio >= :inicio AND a.dataInicio <= :fim
            """)
    Long countByPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
                SELECT a.status, COUNT(a) FROM Agendamento a
                WHERE a.dataInicio >= :inicio AND a.dataInicio <= :fim
                GROUP BY a.status
            """)
    List<Object[]> countByStatusNoPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

}