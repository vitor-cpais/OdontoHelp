package com.OdontoHelp.BackEnd.service;

import com.OdontoHelp.BackEnd.repositories.DentistaRepository;
import com.OdontoHelp.BackEnd.entities.Dentista;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DentistaService {
    private final DentistaRepository dentistaRepository;

    @Autowired
    public DentistaService(DentistaRepository dentistaRepository) {
        this.dentistaRepository = dentistaRepository;
    }

    public List<Dentista> listarTodosDentistas() {
        return dentistaRepository.findAll();
    }

    public Dentista buscarDentistaPorId(Long id) {
        return dentistaRepository.findById(id).orElse(null);
    }

    public Dentista salvarDentista(Dentista dentista) {
        return dentistaRepository.save(dentista);
    }

    public void deletarDentistaPorId(Long id) {
        dentistaRepository.deleteById(id);
    }


}