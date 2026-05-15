package com.OdontoHelpBackend.controller.Clinico;

import com.OdontoHelpBackend.dto.Clinica.Request.ProcedimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ProcedimentoResponseDTO;
import com.OdontoHelpBackend.service.Clinico.ProcedimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/procedimentos")
@RequiredArgsConstructor
public class ProcedimentoController {

    private final ProcedimentoService procedimentoService;

    @GetMapping
    public ResponseEntity<Slice<ProcedimentoResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Boolean isAtivo,
            Pageable pageable) {
        return ResponseEntity.ok(procedimentoService.listar(nome, isAtivo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedimentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(procedimentoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProcedimentoResponseDTO> criar(@RequestBody @Valid ProcedimentoRequestDTO dto) {
        ProcedimentoResponseDTO criado = procedimentoService.criar(dto);
        return ResponseEntity.created(URI.create("/procedimentos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcedimentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid ProcedimentoRequestDTO dto) {
        return ResponseEntity.ok(procedimentoService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProcedimentoResponseDTO> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean isAtivo) {
        return ResponseEntity.ok(procedimentoService.toggleStatus(id, isAtivo));
    }
}
