package com.OdontoHelp.BackEnd.Controller;

import com.OdontoHelp.BackEnd.Service.PacienteService;
import com.OdontoHelp.BackEnd.entities.Paciente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RestController
@RequestMapping("/pacientes")
public class PacienteController {
    private final PacienteService pacienteService;

    @Autowired
    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @GetMapping
    public List<Paciente> listarTodosPacientes() {
        return pacienteService.listarTodosPacientes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPacientePorId(@PathVariable Long id) {
        Paciente paciente = pacienteService.buscarPacientePorId(id);
        if (paciente != null) {
            return ResponseEntity.ok(paciente);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Paciente salvarPaciente(@RequestBody Paciente paciente) {
        return pacienteService.salvarPaciente(paciente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPacientePorId(@PathVariable Long id) {
        Paciente paciente = pacienteService.buscarPacientePorId(id);
        if (paciente != null) {
            pacienteService.deletarPacientePorId(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
