package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.DentistaMapper;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DentistaService {

    private final DentistaRepository dentistaRepository;
    private final UsuarioService usuarioService;
    private final DentistaMapper dentistaMapper;

    public DentistaResponseDTO buscarPorId(Long id) {
        Dentista dentista = buscarEntidadePorId(id);
        return dentistaMapper.toResponse(dentista);
    }

    public Slice<DentistaResponseDTO> listar(String nome, Pageable pageable) {
        Slice<Dentista> dentistas;
        if (nome != null && !nome.isBlank())
            dentistas = dentistaRepository.findByNomeContainingIgnoreCase(nome, pageable);
        else
            dentistas = dentistaRepository.findByIsAtivo(true, pageable);
        return dentistas.map(dentistaMapper::toResponse);
    }

    public DentistaResponseDTO criar(DentistaRequestDTO dto) {
        usuarioService.validarCpfDuplicado(dto.cpf());
        usuarioService.validarEmailDuplicado(dto.email());
        Dentista dentista = dentistaMapper.toEntity(dto);
        dentista.setIsAtivo(true);
        return dentistaMapper.toResponse(dentistaRepository.save(dentista));
    }

    public DentistaResponseDTO atualizar(Long id, DentistaUpdateDTO dto) {
        Dentista dentista = buscarEntidadePorId(id);
        dentistaMapper.updateEntity(dto, dentista);
        return dentistaMapper.toResponse(dentistaRepository.save(dentista));
    }

    public void desativar(Long id) {
        Dentista dentista = buscarEntidadePorId(id);
        dentista.setIsAtivo(false);
        dentistaRepository.save(dentista);
    }

    public Dentista buscarEntidadePorId(Long id) {
        return dentistaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dentista não encontrado"));
    }
}