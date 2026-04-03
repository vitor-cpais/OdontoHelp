package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    long existsById(long id);

    Slice<Usuario> findAllBy(Pageable pageable);

    Slice<Usuario> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    Optional<Usuario> findByEmail(String email);

    Slice<Usuario> findByIsAtivo(Boolean isAtivo, Pageable pageable);

    Long countByIsAtivo(Boolean isAtivo);

}