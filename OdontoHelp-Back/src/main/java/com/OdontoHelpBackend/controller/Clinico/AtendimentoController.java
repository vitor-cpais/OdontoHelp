package com.OdontoHelpBackend.controller.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.IniciarAtendimentoAvulsoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.MarcarItemCobradoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.BaixaPlanoManualRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoPendenteCobrancaDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoUpdateResultDTO;
import com.OdontoHelpBackend.service.Clinico.AtendimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.net.URI;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/atendimentos")
@RequiredArgsConstructor
public class AtendimentoController {

    private final AtendimentoService atendimentoService;

    @GetMapping("/pendentes-cobranca")
    public ResponseEntity<Slice<AtendimentoPendenteCobrancaDTO>> listarPendentesCobranca(
            @RequestParam(required = false) String nomePaciente,
            @RequestParam(required = false) Long dentistaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinalizacaoDe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinalizacaoAte,
            Pageable pageable) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.listarPendentesCobranca(
                nomePaciente, dentistaId, dataFinalizacaoDe, dataFinalizacaoAte, pageable, usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtendimentoResponseDTO> buscarPorId(@PathVariable Long id) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.buscarPorId(id, usuario));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarPorPaciente(
            @PathVariable Long pacienteId,
            Pageable pageable) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.listarPorPaciente(pacienteId, pageable, usuario));
    }

    @GetMapping("/dentista/{dentistaId}")
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarPorDentista(
            @PathVariable Long dentistaId,
            @RequestParam(required = false) String nomePaciente,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) StatusAtendimento status,
            Pageable pageable) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(
                atendimentoService.listarPorDentista(dentistaId, nomePaciente, dataInicio, dataFim, status, pageable, usuario)
        );
    }

    @GetMapping
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarTodos(
            @RequestParam(required = false) String nomePaciente,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) StatusAtendimento status,
            Pageable pageable) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(
                atendimentoService.listarTodos(nomePaciente, dataInicio, dataFim, status, pageable, usuario)
        );
    }

    @PostMapping("/iniciar-avulso")
    public ResponseEntity<AtendimentoResponseDTO> iniciarAvulso(
            @RequestBody @Valid IniciarAtendimentoAvulsoRequestDTO dto) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        AtendimentoResponseDTO atendimento = atendimentoService.iniciarAtendimentoAvulso(dto, usuario);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .location(URI.create("/atendimentos/" + atendimento.id()))
                .body(atendimento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtendimentoUpdateResultDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AtendimentoUpdateDTO dto) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.atualizar(id, dto, usuario));
    }

    @DeleteMapping("/{id}/itens/{itemId}")
    public ResponseEntity<Void> removerItem(
            @PathVariable Long id,
            @PathVariable Long itemId) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        atendimentoService.removerItem(id, itemId, usuario);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/itens/{itemId}/marcar-cobrado")
    public ResponseEntity<Void> marcarItemCobrado(
            @PathVariable Long itemId,
            @RequestBody @Valid MarcarItemCobradoRequestDTO dto) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        atendimentoService.marcarItemCobrado(itemId, dto, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<AtendimentoResponseDTO> finalizar(
            @PathVariable Long id) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.finalizarAtendimento(id, usuario));
    }

    @PatchMapping("/{id}/odontograma-revisado")
    public ResponseEntity<AtendimentoResponseDTO> marcarOdontogramaRevisado(
            @PathVariable Long id,
            @RequestParam boolean revisado) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.marcarOdontogramaRevisado(id, revisado, usuario));
    }

    @PostMapping("/{id}/baixa-plano-manual")
    public ResponseEntity<AtendimentoResponseDTO> baixaPlanoManual(
            @PathVariable Long id,
            @RequestBody @Valid BaixaPlanoManualRequestDTO dto) {

        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(atendimentoService.baixaPlanoManual(id, dto, usuario));
    }
}
