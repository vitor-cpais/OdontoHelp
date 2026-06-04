package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.PacienteMapper;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteAnamneseDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.service.Clinico.OdontogramaService;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioService usuarioService;
    private final PacienteMapper pacienteMapper;
    private final ValidacoesService validacoesService;
    private final OdontogramaService odontogramaService;

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

    @Transactional
    public PacienteResponseDTO criar(PacienteRequestDTO dto) {
        usuarioService.validarCpfDuplicado(dto.cpf());
        String email = normalizarEmail(dto.email());
        usuarioService.validarEmailDuplicado(email);
        Paciente paciente = pacienteMapper.toEntity(dto);
        paciente.setEmail(email);
        paciente.setIsAtivo(true);
        if (paciente.getEndereco() != null) {
            paciente.getEndereco().setUsuario(paciente);
        }

        Paciente salvo = pacienteRepository.save(paciente);
        odontogramaService.garantirSnapshotInicialSeNecessario(salvo.getId());
        return pacienteMapper.toResponse(salvo);
    }

    @Transactional
    public PacienteResponseDTO atualizar(Long id, PacienteUpdateDTO dto) {
        Paciente paciente = buscarEntidadePorId(id);
        usuarioService.validarEmailDuplicadoExcluindoId(normalizarEmail(dto.email()), paciente.getId());
        pacienteMapper.updateEntity(dto, paciente);
        paciente.setEmail(normalizarEmail(dto.email()));
        if (paciente.getEndereco() != null) {
            paciente.getEndereco().setUsuario(paciente);
        }
        return pacienteMapper.toResponse(pacienteRepository.save(paciente));
    }

    private static String normalizarEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim();
    }

    public Paciente buscarEntidadePorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
    }

    @Transactional
    public PacienteResponseDTO atualizarAnamnese(Long id, PacienteAnamneseDTO dto) {
        Paciente paciente = buscarEntidadePorId(id);
        String texto = dto.anamnese();
        paciente.setObservacoesMedicas(texto == null || texto.isBlank() ? null : texto.trim());
        return pacienteMapper.toResponse(pacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteResponseDTO toggleStatus(Long id, boolean isAtivo) {
        if (!isAtivo) {
            validacoesService.validarInativacaoUsuario(id);
        }
        Paciente paciente = buscarEntidadePorId(id);
        paciente.setIsAtivo(isAtivo);

        return pacienteMapper.toResponse(pacienteRepository.save(paciente));
    }
}
