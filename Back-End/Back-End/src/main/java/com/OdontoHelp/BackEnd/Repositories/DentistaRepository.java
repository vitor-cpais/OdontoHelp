package com.OdontoHelp.BackEnd.Repositories;

import com.OdontoHelp.BackEnd.entities.Dentista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


    @Repository
    public interface DentistaRepository extends JpaRepository<Dentista, Long> {

}