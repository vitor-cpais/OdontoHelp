package com.OdontoHelp.BackEnd.Repositories;
import com.OdontoHelp.BackEnd.entities.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


    @Repository
    public interface PacienteRepository extends JpaRepository<Paciente, Long> {
}
