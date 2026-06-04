package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    long existsById(long id);

    Slice<Usuario> findAllBy(Pageable pageable);

    Slice<Usuario> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Usuario> findByEmail(String email);

    Slice<Usuario> findByIsAtivo(Boolean isAtivo, Pageable pageable);

    Slice<Usuario> findByPerfil(PerfilUsuario perfil, Pageable pageable);

    Long countByIsAtivo(Boolean isAtivo);

    @Query("""
            SELECT u FROM Usuario u
            WHERE (:nomePattern IS NULL OR LOWER(u.nome) LIKE :nomePattern)
              AND (:perfil IS NULL OR u.perfil = :perfil)
              AND (:isAtivo IS NULL OR u.isAtivo = :isAtivo)
            """)
    Slice<Usuario> filtrar(
            @Param("nomePattern") String nomePattern,
            @Param("perfil") PerfilUsuario perfil,
            @Param("isAtivo") Boolean isAtivo,
            Pageable pageable
    );

}