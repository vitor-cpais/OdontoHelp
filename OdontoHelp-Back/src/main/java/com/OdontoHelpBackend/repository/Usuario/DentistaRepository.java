package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.Dentista;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DentistaRepository extends JpaRepository<Dentista, Long> {

    Slice<Dentista> findAllBy(Pageable pageable);
    Slice<Dentista> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    Slice<Dentista> findByIsAtivo(Boolean isAtivo, Pageable pageable);
    Long countByIsAtivo(Boolean isAtivo);

    // Dentista usa herança JOINED — o id do usuário É o próprio id da entidade
    @Query("SELECT d FROM Dentista d WHERE d.id = :usuarioId")
    Optional<Dentista> findByUsuarioId(@Param("usuarioId") Long usuarioId);
}
