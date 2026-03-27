package com.OdontoHelpBackend.controller.Consulta;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.dto.Usuario.Request.Consulta.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Consulta.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Agendamento.AgendamentoResponseDTO;
import com.OdontoHelpBackend.service.Consulta.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

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
}