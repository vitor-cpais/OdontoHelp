package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.OdontogramaSnapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OdontogramaSnapshotRepository extends JpaRepository<OdontogramaSnapshot, Long> {

    boolean existsByPacienteId(Long pacienteId);

    Optional<OdontogramaSnapshot> findByAtendimentoId(Long atendimentoId);

    Slice<OdontogramaSnapshot> findByPacienteIdOrderByCriadoEmDesc(Long pacienteId, Pageable pageable);

    List<OdontogramaSnapshot> findByPacienteIdOrderByCriadoEmAsc(Long pacienteId);
}
