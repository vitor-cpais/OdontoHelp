package com.OdontoHelp.BackEnd.Service;

import com.OdontoHelp.BackEnd.Repositories.PacienteRepository;
import com.OdontoHelp.BackEnd.Service.Exception.PacienteNotFoundException;
import com.OdontoHelp.BackEnd.entities.Paciente;
import com.OdontoHelp.BackEnd.entities.models.Observacao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PacienteService {
    private final PacienteRepository pacienteRepository;

    @Autowired
    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    public List<Paciente> listarTodosPacientes() {
        return pacienteRepository.findAll();
    }

    public Paciente buscarPacientePorId(Long id) {
        return pacienteRepository.findById(id).orElse(null);
    }

    public Paciente salvarPaciente(Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    public void deletarPacientePorId(Long id) {
        pacienteRepository.deleteById(id);
    }





}



