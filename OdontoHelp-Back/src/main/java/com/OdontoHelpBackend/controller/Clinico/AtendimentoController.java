package com.OdontoHelpBackend.controller.Clinico;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.service.Clinico.AtendimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Operações sobre um Atendimento já existente.
 *
 * NÃO existe POST /atendimentos — a criação é feita exclusivamente via
 * POST /agendamentos/{id}/iniciar-atendimento (fluxo explícito e auditável).
 *
 * Ciclo de vida exposto:
 *   GET    /atendimentos/{id}                    → buscar
 *   GET    /atendimentos/paciente/{id}            → histórico do paciente
 *   GET    /atendimentos/dentista/{id}            → agenda do dentista
 *   PUT    /atendimentos/{id}                     → editar observações/itens (apenas EM_ANDAMENTO)
 *   POST   /atendimentos/{id}/finalizar           → finalizar (EM_ANDAMENTO → FINALIZADO)
 */
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

    @GetMapping("/dentista/{dentistaId}")
    public ResponseEntity<Slice<AtendimentoResponseDTO>> listarPorDentista(
            @PathVariable Long dentistaId,
            @AuthenticationPrincipal Usuario usuario,
            Pageable pageable) {
        return ResponseEntity.ok(atendimentoService.listarPorDentista(dentistaId, pageable, usuario));
    }

    /**
     * Edita observações e/ou substitui a lista de procedimentos.
     * Rejeitado se status == FINALIZADO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AtendimentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AtendimentoUpdateDTO dto,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(atendimentoService.atualizar(id, dto, usuario));
    }

    /**
     * Finaliza o atendimento.
     * Efeitos colaterais (no service):
     *   - status: EM_ANDAMENTO → FINALIZADO
     *   - horaFim = LocalDateTime.now()
     *   - odontograma do paciente é atualizado
     *   - histórico imutável é gravado por item
     */
    @PostMapping("/{id}/finalizar")
    public ResponseEntity<AtendimentoResponseDTO> finalizar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(atendimentoService.finalizarAtendimento(id, usuario));
    }
}
