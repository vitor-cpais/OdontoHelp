package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    List<Endereco> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioIdAndIsPrincipal(Long usuarioId, Boolean isPrincipal);
}