package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.HistoricoOdontograma;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoricoOdontogramaRepository extends JpaRepository<HistoricoOdontograma, Long> {
    // Histórico completo do paciente — todos os dentes
    Slice<HistoricoOdontograma> findByPacienteIdOrderByRegistradoEmDesc(Long pacienteId, Pageable pageable);
    // Histórico de um dente específico
    Slice<HistoricoOdontograma> findByPacienteIdAndNumeroDenteOrderByRegistradoEmDesc(Long pacienteId, Integer numeroDente, Pageable pageable);
}
