package com.OdontoHelpBackend.controller.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Clinica.Request.PlanoDeTratamentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPlanoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.PlanoDeTratamentoResponseDTO;
import com.OdontoHelpBackend.service.Clinico.PlanoDeTratamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PlanoDeTratamentoController {

    private final PlanoDeTratamentoService planoService;

    @GetMapping("/planos-tratamento/paciente/{pacienteId}")
    public ResponseEntity<Slice<PlanoDeTratamentoResponseDTO>> listarPorPaciente(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        return ResponseEntity.ok(planoService.listarPorPaciente(pacienteId, pageable));
    }

    @GetMapping("/planos-tratamento/paciente/{pacienteId}/unico")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> buscarPlanoUnico(
            @PathVariable Long pacienteId,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(planoService.buscarPlanoUnicoPorPaciente(pacienteId, usuario));
    }

    @GetMapping("/planos-tratamento/{id}")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(planoService.buscarPorId(id));
    }

    @PostMapping("/planos-tratamento")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> criar(
            @RequestBody @Valid PlanoDeTratamentoRequestDTO dto) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        PlanoDeTratamentoResponseDTO criado = planoService.criar(dto, usuario);
        return ResponseEntity.created(URI.create("/planos-tratamento/" + criado.id())).body(criado);
    }

    @PatchMapping("/planos-tratamento/{id}/observacoes")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> atualizarObservacoes(
            @PathVariable Long id,
            @RequestParam String observacoes) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(planoService.atualizarObservacoes(id, observacoes, usuario));
    }

    @PatchMapping("/planos-tratamento/{planoId}/itens/{itemId}/status")
    public ResponseEntity<PlanoDeTratamentoResponseDTO> atualizarStatusItem(
            @PathVariable Long planoId,
            @PathVariable Long itemId,
            @RequestParam StatusItemPlano status,
            @RequestParam(required = false) Long atendimentoRealizacaoId) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(planoService.atualizarStatusItem(
                planoId, itemId, status, atendimentoRealizacaoId, usuario));
    }

    /**
     * Retorna todos os itens PENDENTES do paciente.
     * Usado como referência no AtendimentoDetailPage e no odontograma visual.
     */
    @GetMapping("/pacientes/{pacienteId}/planos/itens-pendentes")
    public ResponseEntity<List<ItemPlanoResponseDTO>> itensPendentes(
            @PathVariable Long pacienteId,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(planoService.listarItensPendentes(pacienteId));
    }
}
