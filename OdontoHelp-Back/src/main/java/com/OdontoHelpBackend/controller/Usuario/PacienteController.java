package com.OdontoHelpBackend.controller.Usuario;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Slice<PacienteResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Boolean isAtivo,
            Pageable pageable) {
        return ResponseEntity.ok(pacienteService.listar(nome, isAtivo, pageable));
    }

    @PostMapping
    public ResponseEntity<PacienteResponseDTO> criar(
            @RequestBody @Valid PacienteRequestDTO dto) {
        PacienteResponseDTO criado = pacienteService.criar(dto);
        URI uri = URI.create("/pacientes/" + criado.id());
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid PacienteUpdateDTO dto) {
        return ResponseEntity.ok(pacienteService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean isAtivo) {
        pacienteService.toggleStatus(id, isAtivo);
        return ResponseEntity.noContent().build();
    }
}