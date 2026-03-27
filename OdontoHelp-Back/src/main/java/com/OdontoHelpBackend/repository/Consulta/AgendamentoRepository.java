package com.OdontoHelpBackend.repository.Consulta;

import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

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
}