package com.OdontoHelp.BackEnd.Repositories;

import com.OdontoHelp.BackEnd.entities.models.Observacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservacaoRepository extends JpaRepository<Observacao, Long> {

    // Se necessário, você pode adicionar métodos de consulta personalizados aqui
}
