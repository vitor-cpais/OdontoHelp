package com.OdontoHelpBackend.controller.Usuario;


import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import com.OdontoHelpBackend.service.Usuario.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Slice<UsuarioResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listar(nome, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody
            @Valid UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> criar(@RequestBody @Valid UsuarioRequestDTO dto) {
        UsuarioResponseDTO response = usuarioService.criar(dto);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<UsuarioResponseDTO> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean isAtivo) {
        return ResponseEntity.ok(usuarioService.toggleStatus(id, isAtivo));
    }
}
