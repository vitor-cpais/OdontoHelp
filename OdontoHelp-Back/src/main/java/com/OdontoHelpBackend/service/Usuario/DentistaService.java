package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.DentistaMapper;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importação essencial

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DentistaService {

    private final DentistaRepository dentistaRepository;
    private final UsuarioService usuarioService;
    private final DentistaMapper dentistaMapper;
    private final ValidacoesService validacoesService;

    public DentistaResponseDTO buscarPorId(Long id) {
        Dentista dentista = buscarEntidadePorId(id);
        return dentistaMapper.toResponse(dentista);
    }

    public Slice<DentistaResponseDTO> listar(String nome, Boolean isAtivo, Pageable pageable) {
        if (nome != null && !nome.isBlank())
            return dentistaRepository.findByNomeContainingIgnoreCase(nome, pageable)
                    .map(dentistaMapper::toResponse);
        if (isAtivo != null)
            return dentistaRepository.findByIsAtivo(isAtivo, pageable)
                    .map(dentistaMapper::toResponse);
        return dentistaRepository.findAllBy(pageable)
                .map(dentistaMapper::toResponse);
    }

    @Transactional
    public DentistaResponseDTO criar(DentistaRequestDTO dto) {
        usuarioService.validarCpfDuplicado(dto.cpf());
        usuarioService.validarEmailDuplicado(dto.email());
        Dentista dentista = dentistaMapper.toEntity(dto);
        dentista.setIsAtivo(true);
        if (dentista.getEndereco() != null) {
            dentista.getEndereco().setUsuario(dentista);
        }

        return dentistaMapper.toResponse(dentistaRepository.save(dentista));
    }

    @Transactional
    public DentistaResponseDTO atualizar(Long id, DentistaUpdateDTO dto) {
        Dentista dentista = buscarEntidadePorId(id);
        dentistaMapper.updateEntity(dto, dentista);

        if (dentista.getEndereco() != null) {
            dentista.getEndereco().setUsuario(dentista);
        }

        return dentistaMapper.toResponse(dentistaRepository.save(dentista));
    }



    public Dentista buscarEntidadePorId(Long id) {
        return dentistaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dentista não encontrado"));
    }

    @Transactional
    public DentistaResponseDTO toggleStatus(Long id, boolean isAtivo) {
        if (!isAtivo) {
            validacoesService.validarInativacaoUsuario(id);
        }

        Dentista dentista = buscarEntidadePorId(id);
        dentista.setIsAtivo(isAtivo);

        return dentistaMapper.toResponse(dentistaRepository.save(dentista));
    }
}
