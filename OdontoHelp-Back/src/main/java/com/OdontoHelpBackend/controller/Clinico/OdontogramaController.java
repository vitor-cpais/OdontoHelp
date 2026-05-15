package com.OdontoHelpBackend.controller.Clinico;


import com.OdontoHelpBackend.dto.Clinica.Response.HistoricoOdontogramaResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.OdontogramaResponseDTO;
import com.OdontoHelpBackend.service.Clinico.OdontogramaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes/{pacienteId}/odontograma")
@RequiredArgsConstructor
public class OdontogramaController {

    private final OdontogramaService odontogramaService;

    // Mapa completo — situação atual de todos os dentes do paciente
    @GetMapping
    public ResponseEntity<List<OdontogramaResponseDTO>> buscar(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(odontogramaService.buscarPorPaciente(pacienteId));
    }

    // Histórico completo — todos os dentes, ordenado por data desc
    @GetMapping("/historico")
    public ResponseEntity<Slice<HistoricoOdontogramaResponseDTO>> historico(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        return ResponseEntity.ok(odontogramaService.buscarHistorico(pacienteId, pageable));
    }

    // Histórico de um dente específico
    @GetMapping("/historico/{numeroDente}")
    public ResponseEntity<Slice<HistoricoOdontogramaResponseDTO>> historicoPorDente(
            @PathVariable Long pacienteId,
            @PathVariable Integer numeroDente,
            Pageable pageable) {
        return ResponseEntity.ok(odontogramaService.buscarHistoricoPorDente(pacienteId, numeroDente, pageable));
    }
}
