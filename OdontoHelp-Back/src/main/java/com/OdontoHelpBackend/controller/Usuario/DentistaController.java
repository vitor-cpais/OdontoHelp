package com.OdontoHelpBackend.controller.Usuario;



import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
@RequestMapping("/dentistas")
@RequiredArgsConstructor
public class DentistaController {

    private final DentistaService dentistaService;

    @GetMapping("/{id}")
    public ResponseEntity<DentistaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(dentistaService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Slice<DentistaResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            Pageable pageable) {
        return ResponseEntity.ok(dentistaService.listar(nome, pageable));
    }

    @PostMapping
    public ResponseEntity<DentistaResponseDTO> criar(
            @RequestBody
            @Valid DentistaRequestDTO dto) {
        DentistaResponseDTO criado = dentistaService.criar(dto);
        URI uri = URI.create("/dentistas/" + criado.id());
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DentistaResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid DentistaUpdateDTO dto) {
        return ResponseEntity.ok(dentistaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        dentistaService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}