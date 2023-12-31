package com.OdontoHelp.BackEnd.repositories;

import com.OdontoHelp.BackEnd.entities.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

}