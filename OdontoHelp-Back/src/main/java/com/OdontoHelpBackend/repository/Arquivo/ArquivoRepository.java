package com.OdontoHelpBackend.repository.Arquivo;

import com.OdontoHelpBackend.domain.Arquivo.Arquivo;
import com.OdontoHelpBackend.domain.Arquivo.Enums.TipoArquivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArquivoRepository extends JpaRepository<Arquivo, Long> {

    List<Arquivo> findByPacienteIdOrderByCriadoEmDesc(Long pacienteId);

    List<Arquivo> findByPacienteIdAndTipoOrderByCriadoEmDesc(Long pacienteId, TipoArquivo tipo);

    List<Arquivo> findByPacienteIdAndAtendimentoIdOrderByCriadoEmDesc(Long pacienteId, Long atendimentoId);

    Optional<Arquivo> findByIdAndPacienteId(Long id, Long pacienteId);

    Optional<Arquivo> findByPacienteIdAndTipoAndPrincipalTrue(Long pacienteId, TipoArquivo tipo);

    @Modifying
    @Query("UPDATE Arquivo a SET a.principal = false WHERE a.paciente.id = :pacienteId AND a.tipo = :tipo AND a.principal = true")
    void limparPrincipal(@Param("pacienteId") Long pacienteId, @Param("tipo") TipoArquivo tipo);
}
