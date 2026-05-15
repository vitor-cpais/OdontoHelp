package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}