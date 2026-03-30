package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Slice<Paciente> findAllBy(Pageable pageable);

    Slice<Paciente> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Slice<Paciente> findByIsAtivo(Boolean isAtivo, Pageable pageable);

    Long countByIsAtivo(Boolean isAtivo);
}