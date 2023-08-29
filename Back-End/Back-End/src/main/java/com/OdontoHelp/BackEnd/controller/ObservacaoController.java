package com.OdontoHelp.BackEnd.controller;

import com.OdontoHelp.BackEnd.service.ObservacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/observacoes")
public class ObservacaoController {

    private final ObservacaoService observacaoService;

    @Autowired
    public ObservacaoController(ObservacaoService observacaoService) {
        this.observacaoService = observacaoService;
    }




}