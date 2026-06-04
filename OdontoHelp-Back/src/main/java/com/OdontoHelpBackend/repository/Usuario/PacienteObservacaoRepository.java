package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.PacienteObservacao;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteObservacaoRepository extends JpaRepository<PacienteObservacao, Long> {

    Slice<PacienteObservacao> findByPacienteIdOrderByCriadoEmDesc(Long pacienteId, Pageable pageable);
}
