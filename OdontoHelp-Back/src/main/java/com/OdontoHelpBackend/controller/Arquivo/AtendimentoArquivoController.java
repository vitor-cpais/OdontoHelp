package com.OdontoHelpBackend.controller.Arquivo;

import com.OdontoHelpBackend.domain.Arquivo.Enums.TipoArquivo;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Arquivo.ArquivoResponseDTO;
import com.OdontoHelpBackend.service.Arquivo.ArquivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequestMapping("/atendimentos/{atendimentoId}/arquivos")
@RequiredArgsConstructor
public class AtendimentoArquivoController {

    private final ArquivoService arquivoService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ArquivoResponseDTO> upload(
            @PathVariable Long atendimentoId,
            @RequestParam("file") MultipartFile file,
            @RequestParam TipoArquivo tipo,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) Integer numeroDente,
            @AuthenticationPrincipal Usuario usuario) {
        ArquivoResponseDTO criado = arquivoService.uploadPorAtendimento(
                atendimentoId, file, tipo, descricao, numeroDente, usuario);
        return ResponseEntity.created(
                URI.create("/atendimentos/" + atendimentoId + "/arquivos/" + criado.id())
        ).body(criado);
    }
}
