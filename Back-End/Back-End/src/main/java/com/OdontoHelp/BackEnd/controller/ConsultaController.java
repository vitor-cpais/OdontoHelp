package com.OdontoHelp.BackEnd.controller;

import com.OdontoHelp.BackEnd.dto.ConsultaDTO;
import com.OdontoHelp.BackEnd.entities.Consulta;
import com.OdontoHelp.BackEnd.service.ConsultaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {

    private final ConsultaService consultaService;

    @Autowired
    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping
    public List<ConsultaDTO> listarTodasConsultas() {
        List<Consulta> consultas = consultaService.listarTodasConsultas();
        return consultas.stream().map(ConsultaDTO::fromEntity).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaDTO> buscarConsultaPorId(@PathVariable Long id) {
        Consulta consulta = consultaService.buscarConsultaPorId(id);
        if (consulta != null) {
            return ResponseEntity.ok(ConsultaDTO.fromEntity(consulta));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ConsultaDTO salvarConsulta(@RequestBody ConsultaDTO consultaDTO) {
        Consulta consulta = consultaService.salvarConsulta(consultaDTO.toEntity());
        return ConsultaDTO.fromEntity(consulta);
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
