package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {

    boolean existsByAgendamentoId(Long agendamentoId);
    Optional<Atendimento> findByAgendamentoId(Long agendamentoId);
    Slice<Atendimento> findByPacienteId(Long pacienteId, Pageable pageable);
    Slice<Atendimento> findByDentistaId(Long dentistaId, Pageable pageable);
    Slice<Atendimento> findByPacienteIdAndStatus(Long pacienteId, StatusAtendimento status, Pageable pageable);
    boolean existsByPacienteIdAndStatusIn(Long pacienteId, List<StatusAtendimento> statuses);
    boolean existsByDentistaIdAndStatusIn(Long dentistaId, List<StatusAtendimento> statuses);


    @Query("""
        SELECT a FROM Atendimento a
        JOIN a.paciente p
        WHERE a.dentista.id = :dentistaId
        AND (CAST(:nomePaciente AS string) IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', CAST(:nomePaciente AS string), '%')))
        AND (CAST(:dataInicio AS localdatetime) IS NULL OR a.horaInicio >= :dataInicio)
        AND (CAST(:dataFim AS localdatetime) IS NULL OR a.horaInicio <= :dataFim)
        AND (CAST(:status AS string) IS NULL OR a.status = :status)
        ORDER BY a.horaInicio DESC
    """)
    Slice<Atendimento> filtrarPorDentista(
            @Param("dentistaId")   Long dentistaId,
            @Param("nomePaciente") String nomePaciente,
            @Param("dataInicio")   LocalDateTime dataInicio,
            @Param("dataFim")      LocalDateTime dataFim,
            @Param("status")       StatusAtendimento status,
            Pageable pageable
    );


    @Query("""
        SELECT a FROM Atendimento a
        JOIN a.paciente p
        WHERE (CAST(:nomePaciente AS string) IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', CAST(:nomePaciente AS string), '%')))
        AND (CAST(:dataInicio AS localdatetime) IS NULL OR a.horaInicio >= :dataInicio)
        AND (CAST(:dataFim AS localdatetime) IS NULL OR a.horaInicio <= :dataFim)
        AND (CAST(:status AS string) IS NULL OR a.status = :status)
        ORDER BY a.horaInicio DESC
    """)
    Slice<Atendimento> filtrarTodos(
            @Param("nomePaciente") String nomePaciente,
            @Param("dataInicio")   LocalDateTime dataInicio,
            @Param("dataFim")      LocalDateTime dataFim,
            @Param("status")       StatusAtendimento status,
            Pageable pageable
    );

    @Query("""
        SELECT a FROM Atendimento a
        JOIN a.paciente p
        JOIN a.dentista d
        WHERE a.status = com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento.FINALIZADO
          AND EXISTS (
            SELECT 1 FROM ItemAtendimento i
            WHERE i.atendimento = a
              AND i.statusCobranca = com.OdontoHelpBackend.domain.Clinico.Enums.StatusCobrancaItem.PENDENTE
          )
          AND (CAST(:nomePaciente AS string) IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', CAST(:nomePaciente AS string), '%')))
          AND (CAST(:dentistaId AS long) IS NULL OR d.id = :dentistaId)
          AND (CAST(:dataInicio AS localdatetime) IS NULL OR COALESCE(a.horaFim, a.horaInicio) >= :dataInicio)
          AND (CAST(:dataFim AS localdatetime) IS NULL OR COALESCE(a.horaFim, a.horaInicio) <= :dataFim)
        ORDER BY COALESCE(a.horaFim, a.horaInicio) DESC, a.id DESC
        """)
    Slice<Atendimento> findPendentesCobranca(
            @Param("nomePaciente") String nomePaciente,
            @Param("dentistaId") Long dentistaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);
}