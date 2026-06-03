package com.OdontoHelpBackend.controller.Clinico;

import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtualizarDenteRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.HistoricoOdontogramaResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.OdontogramaResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.service.Clinico.OdontogramaService;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes/{pacienteId}/odontograma")
@RequiredArgsConstructor
public class OdontogramaController {

    private final OdontogramaService odontogramaService;
    private final DentistaService dentistaService;

    @GetMapping
    public ResponseEntity<List<OdontogramaResponseDTO>> buscar(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(odontogramaService.buscarPorPaciente(pacienteId));
    }

    @GetMapping("/historico")
    public ResponseEntity<Slice<HistoricoOdontogramaResponseDTO>> historico(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        return ResponseEntity.ok(odontogramaService.buscarHistorico(pacienteId, pageable));
    }

    @GetMapping("/historico/{numeroDente}")
    public ResponseEntity<Slice<HistoricoOdontogramaResponseDTO>> historicoPorDente(
            @PathVariable Long pacienteId,
            @PathVariable Integer numeroDente,
            Pageable pageable) {
        return ResponseEntity.ok(odontogramaService.buscarHistoricoPorDente(pacienteId, numeroDente, pageable));
    }


    @PatchMapping("/{numeroDente}")
    public ResponseEntity<OdontogramaResponseDTO> atualizarDente(
            @PathVariable Long pacienteId,
            @PathVariable Integer numeroDente,
            @Valid @RequestBody AtualizarDenteRequestDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {

        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO) {
            throw new AcessoNegadoException("Recepcionista não pode alterar o odontograma diretamente");
        }

        Dentista dentista;
        if (usuarioLogado.getPerfil() == PerfilUsuario.ADMIN) {
            dentista = odontogramaService.resolverDentistaResponsavel(pacienteId);
        } else {
            dentista = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        }

        return ResponseEntity.ok(
                odontogramaService.atualizarDiretamente(pacienteId, numeroDente, dto, dentista, usuarioLogado)
        );
    }
}
