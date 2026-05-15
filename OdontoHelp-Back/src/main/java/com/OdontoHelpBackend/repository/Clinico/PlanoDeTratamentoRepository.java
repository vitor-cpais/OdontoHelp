package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.PlanoDeTratamento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanoDeTratamentoRepository extends JpaRepository<PlanoDeTratamento, Long> {
    Slice<PlanoDeTratamento> findByPacienteId(Long pacienteId, Pageable pageable);
    Slice<PlanoDeTratamento> findByDentistaId(Long dentistaId, Pageable pageable);
}
