package com.OdontoHelpBackend.controller.Consulta;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Consulta.Response.Agendamento.AgendamentoResponseDTO;
import com.OdontoHelpBackend.service.Consulta.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.buscarPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Slice<AgendamentoResponseDTO>> listarPorPaciente(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        return ResponseEntity.ok(agendamentoService.listarPorPaciente(pacienteId, pageable));
    }

    @GetMapping("/dentista/{dentistaId}")
    public ResponseEntity<Slice<AgendamentoResponseDTO>> listarPorDentista(
            @PathVariable Long dentistaId,
            Pageable pageable) {
        return ResponseEntity.ok(agendamentoService.listarPorDentista(dentistaId, pageable));
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> criar(
            @RequestBody @Valid AgendamentoRequestDTO dto) {
        AgendamentoResponseDTO criado = agendamentoService.criar(dto);
        URI uri = URI.create("/agendamentos/" + criado.id());
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AgendamentoUpdateDTO dto) {
        return ResponseEntity.ok(agendamentoService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusConsulta status) {
        return ResponseEntity.ok(agendamentoService.atualizarStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        agendamentoService.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Slice<AgendamentoResponseDTO>> filtrar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dataFim,
            @RequestParam(required = false) StatusConsulta status,
            @RequestParam(required = false) Long dentistaId,
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) String nome,
            Pageable pageable) {
        return ResponseEntity.ok(agendamentoService.filtrar(
                dataInicio != null ? dataInicio.atStartOfDay() : null,
                dataFim != null ? dataFim.atTime(23, 59, 59) : null,
                status, dentistaId, pacienteId, nome, pageable));
    }
}