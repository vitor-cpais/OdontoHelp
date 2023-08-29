package com.OdontoHelp.BackEnd.service;

import com.OdontoHelp.BackEnd.repositories.ConsultaRepository;
import com.OdontoHelp.BackEnd.entities.Consulta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConsultaService {
    private final ConsultaRepository consultaRepository;

    @Autowired
    public ConsultaService(ConsultaRepository consultaRepository) {
        this.consultaRepository = consultaRepository;
    }

    public List<Consulta> listarTodasConsultas() {
        return consultaRepository.findAll();
    }

    public Consulta buscarConsultaPorId(Long id) {
        return consultaRepository.findById(id).orElse(null);
    }

    public Consulta salvarConsulta(Consulta consulta) {
        return consultaRepository.save(consulta);
    }

    public void deletarConsultaPorId(Long id) {
        consultaRepository.deleteById(id);
    }


}
