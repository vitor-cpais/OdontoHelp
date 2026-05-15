// ─── ProcedimentoRepository.java ─────────────────────────────────────────────
package com.OdontoHelpBackend.repository.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcedimentoRepository extends JpaRepository<Procedimento, Long> {
    Slice<Procedimento> findAllBy(Pageable pageable);
    Slice<Procedimento> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    Slice<Procedimento> findByIsAtivo(Boolean isAtivo, Pageable pageable);
    boolean existsByNomeIgnoreCase(String nome);
}
