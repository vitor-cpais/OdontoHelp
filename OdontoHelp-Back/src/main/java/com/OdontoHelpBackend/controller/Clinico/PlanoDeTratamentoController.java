package com.OdontoHelpBackend.controller.Clinico;


import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Clinica.Request.PlanoDeTratamentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.PlanoDeTratamentoResponseDTO;
import com.OdontoHelpBackend.service.Clinico.PlanoDeTratamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/planos-tratamento")
@RequiredArgsConstructor
public class PlanoDeTratamentoController {

    private final PlanoDeTratamentoService planoService;

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Slice<PlanoDeTratamentoResponseDTO>> listarPorPaciente(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        return ResponseEntity.ok(planoService.listarPorPaciente(pacienteId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(planoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PlanoDeTratamentoResponseDTO> criar(
            @RequestBody @Valid PlanoDeTratamentoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuario) {
        PlanoDeTratamentoResponseDTO criado = planoService.criar(dto, usuario);
        return ResponseEntity.created(URI.create("/planos-tratamento/" + criado.id())).body(criado);
    }

    @PatchMapping("/{id}/observacoes")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> atualizarObservacoes(
            @PathVariable Long id,
            @RequestParam String observacoes,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(planoService.atualizarObservacoes(id, observacoes, usuario));
    }

    @PatchMapping("/{planoId}/itens/{itemId}/status")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> atualizarStatusItem(
            @PathVariable Long planoId,
            @PathVariable Long itemId,
            @RequestParam StatusItemPlano status,
            @RequestParam(required = false) Long atendimentoRealizacaoId,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(planoService.atualizarStatusItem(
                planoId, itemId, status, atendimentoRealizacaoId, usuario));
    }
}
