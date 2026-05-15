package com.OdontoHelpBackend.controller.Consulta;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Clinica.Request.IniciarAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Consulta.Response.Agendamento.AgendamentoResponseDTO;
import com.OdontoHelpBackend.service.Clinico.AtendimentoService;
import com.OdontoHelpBackend.service.Consulta.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;
    private final AtendimentoService atendimentoService;

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
        return ResponseEntity.created(URI.create("/agendamentos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AgendamentoUpdateDTO dto,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(agendamentoService.atualizar(id, dto, usuario));
    }

    /**
     * Transições manuais de status permitidas: AGENDADO → CONFIRMADO, CANCELADO, FALTA.
     * A transição para ATENDIDO é feita EXCLUSIVAMENTE via POST /{id}/iniciar-atendimento.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusConsulta status,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(agendamentoService.atualizarStatus(id, status, usuario));
    }

    /**
     * Ação explícita para iniciar o atendimento clínico.
     *
     * POST /agendamentos/{id}/iniciar-atendimento
     *
     * Efeitos colaterais (gerenciados pelo service, não pelo controller):
     *   1. Cria um Atendimento com status EM_ANDAMENTO vinculado a este Agendamento.
     *   2. Muda o Agendamento para status ATENDIDO.
     *
     * Regras validadas no service:
     *   - Agendamento deve estar em AGENDADO ou CONFIRMADO.
     *   - Não pode já existir um Atendimento para este Agendamento.
     *   - Dentista logado deve ser o dono do agendamento (perfil DENTISTA).
     */
    @PostMapping("/{id}/iniciar-atendimento")
    public ResponseEntity<AtendimentoResponseDTO> iniciarAtendimento(
            @PathVariable Long id,
            @RequestBody(required = false) IniciarAtendimentoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuario) {

        AtendimentoResponseDTO atendimento = atendimentoService.iniciarAtendimento(id, dto, usuario);
        return ResponseEntity.created(URI.create("/atendimentos/" + atendimento.id())).body(atendimento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        agendamentoService.cancelar(id, usuario);
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
            @AuthenticationPrincipal Usuario usuario,
            Pageable pageable) {
        return ResponseEntity.ok(agendamentoService.filtrar(
                dataInicio != null ? dataInicio.atStartOfDay() : null,
                dataFim    != null ? dataFim.atTime(23, 59, 59) : null,
                status, dentistaId, pacienteId, nome, pageable, usuario));
    }
}
