package com.OdontoHelpBackend.repository.Usuario;

import com.OdontoHelpBackend.domain.usuario.Dentista;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DentistaRepository extends JpaRepository<Dentista, Long> {

    Slice<Dentista> findAllBy(Pageable pageable);

    Slice<Dentista> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Slice<Dentista> findByIsAtivo(Boolean isAtivo, Pageable pageable);
}