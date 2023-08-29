package com.OdontoHelp.BackEnd.controller;// Dentro da classe DentistaController.java (em controllers)

import com.OdontoHelp.BackEnd.service.DentistaService;
import com.OdontoHelp.BackEnd.entities.Dentista;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@Controller
@RestController
@RequestMapping("/dentistas")
public class DentistaController {
    private final DentistaService dentistaService;

    @Autowired
    public DentistaController(DentistaService dentistaService) {
        this.dentistaService = dentistaService;
    }

    @GetMapping
    public List<Dentista> listarTodosDentistas() {
        return dentistaService.listarTodosDentistas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dentista> buscarDentistaPorId(@PathVariable Long id) {
        Dentista dentista = dentistaService.buscarDentistaPorId(id);
        if (dentista != null) {
            return ResponseEntity.ok(dentista);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Dentista salvarDentista(@RequestBody Dentista dentista) {
        return dentistaService.salvarDentista(dentista);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarDentistaPorId(@PathVariable Long id) {
        Dentista dentista = dentistaService.buscarDentistaPorId(id);
        if (dentista != null) {
            dentistaService.deletarDentistaPorId(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
