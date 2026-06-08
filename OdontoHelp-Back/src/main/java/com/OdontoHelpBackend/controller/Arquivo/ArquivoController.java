package com.OdontoHelpBackend.controller.Arquivo;

import com.OdontoHelpBackend.domain.Arquivo.Enums.TipoArquivo;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Arquivo.ArquivoResponseDTO;
import com.OdontoHelpBackend.service.Arquivo.ArquivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/pacientes/{pacienteId}/arquivos")
@RequiredArgsConstructor
public class ArquivoController {

    private final ArquivoService arquivoService;

    @GetMapping
    public ResponseEntity<List<ArquivoResponseDTO>> listar(
            @PathVariable Long pacienteId,
            @RequestParam(required = false) TipoArquivo tipo,
            @RequestParam(required = false) Long atendimentoId) {
        return ResponseEntity.ok(arquivoService.listar(pacienteId, tipo, atendimentoId));
    }

    @GetMapping("/foto-principal")
    public ResponseEntity<ArquivoResponseDTO> fotoPrincipal(@PathVariable Long pacienteId) {
        ArquivoResponseDTO foto = arquivoService.buscarFotoPrincipal(pacienteId);
        if (foto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(foto);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ArquivoResponseDTO> upload(
            @PathVariable Long pacienteId,
            @RequestParam("file") MultipartFile file,
            @RequestParam TipoArquivo tipo,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) Integer numeroDente,
            @RequestParam(required = false, defaultValue = "false") boolean principal,
            @AuthenticationPrincipal Usuario usuario) {
        ArquivoResponseDTO criado = arquivoService.upload(
                pacienteId, file, tipo, descricao, numeroDente, principal, usuario);
        return ResponseEntity.created(URI.create("/pacientes/" + pacienteId + "/arquivos/" + criado.id())).body(criado);
    }

    @GetMapping("/{arquivoId}/download")
    public ResponseEntity<InputStreamResource> download(
            @PathVariable Long pacienteId,
            @PathVariable Long arquivoId) {
        return arquivoService.download(pacienteId, arquivoId);
    }

    @DeleteMapping("/{arquivoId}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long pacienteId,
            @PathVariable Long arquivoId) {
        arquivoService.excluir(pacienteId, arquivoId);
        return ResponseEntity.noContent().build();
    }
}
