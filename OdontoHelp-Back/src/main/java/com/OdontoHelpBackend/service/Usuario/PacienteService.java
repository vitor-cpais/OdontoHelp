package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.PacienteMapper;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
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

    public PacienteResponseDTO buscarPorId(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        return pacienteMapper.toResponse(paciente);
    }

    public Slice<PacienteResponseDTO> listar(String nome, Pageable pageable) {
        Slice<Paciente> pacientes;
        if (nome != null && !nome.isBlank())
            pacientes = pacienteRepository.findByNomeContainingIgnoreCase(nome, pageable);
        else
            pacientes = pacienteRepository.findByIsAtivo(true, pageable);
        return pacientes.map(pacienteMapper::toResponse);
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

    public void desativar(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        paciente.setIsAtivo(false);
        pacienteRepository.save(paciente);
    }

    public Paciente buscarEntidadePorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
    }
}