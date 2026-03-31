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

    boolean existsByPacienteIdAndStatusIn(Long pacienteId, List<StatusConsulta> statuses);
    boolean existsByDentistaIdAndStatusIn(Long dentistaId, List<StatusConsulta> statuses);

    Slice<Agendamento> findByPacienteId(Long pacienteId, Pageable pageable);
    Slice<Agendamento> findByDentistaId(Long dentistaId, Pageable pageable);
    Slice<Agendamento> findByStatus(StatusConsulta status, Pageable pageable);

    boolean existsByDentistaIdAndStatusNotAndDataInicioLessThanAndDataFimGreaterThan(
            Long dentistaId,
            StatusConsulta status,
            LocalDateTime dataFim,
            LocalDateTime dataInicio
    );

    @Query(value = """
            SELECT * FROM tb_agendamento a
            WHERE (CAST(:dataInicio AS timestamp) IS NULL OR a.data_inicio >= CAST(:dataInicio AS timestamp))
            AND (CAST(:dataFim AS timestamp) IS NULL OR a.data_fim <= CAST(:dataFim AS timestamp))
            AND (CAST(:status AS text) IS NULL OR a.status = CAST(:status AS text))
            AND (CAST(:dentistaId AS bigint) IS NULL OR a.dentista_id = CAST(:dentistaId AS bigint))
            AND (CAST(:pacienteId AS bigint) IS NULL OR a.paciente_id = CAST(:pacienteId AS bigint))
        """,
            countQuery = """
            SELECT COUNT(*) FROM tb_agendamento a
            WHERE (CAST(:dataInicio AS timestamp) IS NULL OR a.data_inicio >= CAST(:dataInicio AS timestamp))
            AND (CAST(:dataFim AS timestamp) IS NULL OR a.data_fim <= CAST(:dataFim AS timestamp))
            AND (CAST(:status AS text) IS NULL OR a.status = CAST(:status AS text))
            AND (CAST(:dentistaId AS bigint) IS NULL OR a.dentista_id = CAST(:dentistaId AS bigint))
            AND (CAST(:pacienteId AS bigint) IS NULL OR a.paciente_id = CAST(:pacienteId AS bigint))
        """,
            nativeQuery = true)
    Slice<Agendamento> filtrar(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            @Param("status") String status,
            @Param("pacienteId") Long pacienteId,
            @Param("dentistaId") Long dentistaId,
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