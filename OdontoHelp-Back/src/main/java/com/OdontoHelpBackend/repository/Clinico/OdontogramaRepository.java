package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Odontograma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OdontogramaRepository extends JpaRepository<Odontograma, Long> {
    List<Odontograma> findByPacienteId(Long pacienteId);
    Optional<Odontograma> findByPacienteIdAndNumeroDente(Long pacienteId, Integer numeroDente);
}
