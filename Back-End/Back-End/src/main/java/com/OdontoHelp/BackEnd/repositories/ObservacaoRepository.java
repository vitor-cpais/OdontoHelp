package com.OdontoHelp.BackEnd.repositories;

import com.OdontoHelp.BackEnd.entities.util.Observacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservacaoRepository extends JpaRepository<Observacao, Long> {

    // Se necessário, você pode adicionar métodos de consulta personalizados aqui
}
