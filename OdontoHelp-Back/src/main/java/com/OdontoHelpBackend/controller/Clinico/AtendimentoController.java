package com.OdontoHelpBackend.controller.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.service.Clinico.AtendimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/atendimentos")
@RequiredArgsConstructor
public class AtendimentoController {

    private final AtendimentoService atendimentoService;

    @GetMapping("/{id}")
    public ResponseEntity<AtendimentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(atendimentoService.buscarPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarPorPaciente(
            @PathVariable Long pacienteId,
            @AuthenticationPrincipal Usuario usuario,
            Pageable pageable) {
        return ResponseEntity.ok(atendimentoService.listarPorPaciente(pacienteId, pageable, usuario));
    }

    // CORREÇÃO: adicionados filtros opcionais de nomePaciente, dataInicio, dataFim e status
    @GetMapping("/dentista/{dentistaId}")
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarPorDentista(
            @PathVariable Long dentistaId,
            @RequestParam(required = false) String nomePaciente,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) StatusAtendimento status,
            @AuthenticationPrincipal Usuario usuario,
            Pageable pageable) {
        return ResponseEntity.ok(
                atendimentoService.listarPorDentista(dentistaId, nomePaciente, dataInicio, dataFim, status, pageable, usuario)
        );
    }

    // NOVO: endpoint para ADMIN ver todos os atendimentos sem filtro de dentista
    @GetMapping
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarTodos(
            @RequestParam(required = false) String nomePaciente,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) StatusAtendimento status,
            @AuthenticationPrincipal Usuario usuario,
            Pageable pageable) {
        return ResponseEntity.ok(
                atendimentoService.listarTodos(nomePaciente, dataInicio, dataFim, status, pageable)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtendimentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AtendimentoUpdateDTO dto,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(atendimentoService.atualizar(id, dto, usuario));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<AtendimentoResponseDTO> finalizar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(atendimentoService.finalizarAtendimento(id, usuario));
    }
}
