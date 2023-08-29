package com.OdontoHelp.BackEnd.controller;// Dentro da classe ConsultaController.java (em controllers)

import com.OdontoHelp.BackEnd.service.ConsultaService;
import com.OdontoHelp.BackEnd.entities.Consulta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RestController
@RequestMapping("/consultas")
public class ConsultaController {
    private final ConsultaService consultaService;

    @Autowired
    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping
    public List<Consulta> listarTodasConsultas() {
        return consultaService.listarTodasConsultas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consulta> buscarConsultaPorId(@PathVariable Long id) {
        Consulta consulta = consultaService.buscarConsultaPorId(id);
        if (consulta != null) {
            return ResponseEntity.ok(consulta);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Consulta salvarConsulta(@RequestBody Consulta consulta) {
        return consultaService.salvarConsulta(consulta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarConsultaPorId(@PathVariable Long id) {
        Consulta consulta = consultaService.buscarConsultaPorId(id);
        if (consulta != null) {
            consultaService.deletarConsultaPorId(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
