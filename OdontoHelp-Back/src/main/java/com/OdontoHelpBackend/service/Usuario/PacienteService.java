package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.PacienteMapper;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioService usuarioService;
    private final PacienteMapper pacienteMapper;
    private final ValidacoesService validacoesService;

    public PacienteResponseDTO buscarPorId(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        return pacienteMapper.toResponse(paciente);
    }

    public Slice<PacienteResponseDTO> listar(String nome, Boolean isAtivo, Pageable pageable) {
        if (nome != null && !nome.isBlank())
            return pacienteRepository.findByNomeContainingIgnoreCase(nome, pageable)
                    .map(pacienteMapper::toResponse);
        if (isAtivo != null)
            return pacienteRepository.findByIsAtivo(isAtivo, pageable)
                    .map(pacienteMapper::toResponse);
        return pacienteRepository.findAllBy(pageable)
                .map(pacienteMapper::toResponse);
    }

    public PacienteResponseDTO criar(PacienteRequestDTO dto) {
        usuarioService.validarCpfDuplicado(dto.cpf());
        usuarioService.validarEmailDuplicado(dto.email());
        Paciente paciente = pacienteMapper.toEntity(dto);
        paciente.setIsAtivo(true);
        return pacienteMapper.toResponse(pacienteRepository.save(paciente));
    }

    public PacienteResponseDTO atualizar(Long id, PacienteUpdateDTO dto) {
        Paciente paciente = buscarEntidadePorId(id);
        pacienteMapper.updateEntity(dto, paciente);
        return pacienteMapper.toResponse(pacienteRepository.save(paciente));
    }


    public Paciente buscarEntidadePorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
    }


    public PacienteResponseDTO toggleStatus(Long id, boolean isAtivo) {
        // Só valida se o novo status for 'false' (inativar)
        if (!isAtivo) {
            validacoesService.validarInativacaoUsuario(id);
        }

        Paciente paciente = buscarEntidadePorId(id);
        paciente.setIsAtivo(isAtivo);

        return pacienteMapper.toResponse(pacienteRepository.save(paciente));
    }
}

