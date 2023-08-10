package com.OdontoHelp.BackEnd.Controller;

import com.OdontoHelp.BackEnd.Service.ObservacaoService;
import com.OdontoHelp.BackEnd.entities.models.Observacao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/observacoes")
public class ObservacaoController {

    private final ObservacaoService observacaoService;

    @Autowired
    public ObservacaoController(ObservacaoService observacaoService) {
        this.observacaoService = observacaoService;
    }




}