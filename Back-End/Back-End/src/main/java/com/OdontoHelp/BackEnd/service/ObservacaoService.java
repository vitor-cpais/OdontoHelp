package com.OdontoHelp.BackEnd.service;

import com.OdontoHelp.BackEnd.repositories.ObservacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ObservacaoService {

    private final ObservacaoRepository observacaoRepository;

    @Autowired
    public ObservacaoService(ObservacaoRepository observacaoRepository) {
        this.observacaoRepository = observacaoRepository;
    }



}




