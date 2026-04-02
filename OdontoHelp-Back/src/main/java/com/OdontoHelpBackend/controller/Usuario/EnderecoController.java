package com.OdontoHelpBackend.controller.Usuario;


import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Endereco.EnderecoResponseDTO;
import com.OdontoHelpBackend.service.Usuario.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;


@RestController
@RequestMapping("/usuarios/{usuarioId}/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public ResponseEntity<EnderecoResponseDTO> buscar(@PathVariable Long usuarioId) {
        // Alterado de List para EnderecoResponseDTO único
        return ResponseEntity.ok(enderecoService.buscarPorUsuario(usuarioId));
    }

    @PostMapping
    public ResponseEntity<EnderecoResponseDTO> criar(
            @PathVariable Long usuarioId,
            @RequestBody @Valid EnderecoRequestDTO dto) {
        EnderecoResponseDTO criado = enderecoService.criar(usuarioId, dto);
        URI uri = URI.create("/usuarios/" + usuarioId + "/enderecos/" + criado.id());
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{enderecoId}")
    public ResponseEntity<EnderecoResponseDTO> atualizar(
            @PathVariable Long usuarioId,
            @PathVariable Long enderecoId,
            @RequestBody @Valid EnderecoUpdateDTO dto) {
        return ResponseEntity.ok(enderecoService.atualizar(usuarioId, enderecoId, dto));
    }

    @DeleteMapping("/{enderecoId}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long usuarioId,
            @PathVariable Long enderecoId) {
        enderecoService.deletar(usuarioId, enderecoId);
        return ResponseEntity.noContent().build();
    }
}

