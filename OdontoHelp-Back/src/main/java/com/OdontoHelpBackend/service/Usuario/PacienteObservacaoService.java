package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.PacienteObservacao;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteObservacaoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteObservacaoResponseDTO;
import com.OdontoHelpBackend.repository.Usuario.PacienteObservacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacienteObservacaoService {

    private final PacienteObservacaoRepository observacaoRepository;
    private final PacienteService pacienteService;

    public Slice<PacienteObservacaoResponseDTO> listar(Long pacienteId, Pageable pageable) {
        pacienteService.buscarEntidadePorId(pacienteId);
        return observacaoRepository.findByPacienteIdOrderByCriadoEmDesc(pacienteId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public PacienteObservacaoResponseDTO criar(Long pacienteId, PacienteObservacaoRequestDTO dto, Usuario autor) {
        Paciente paciente = pacienteService.buscarEntidadePorId(pacienteId);
        PacienteObservacao salva = observacaoRepository.save(
                PacienteObservacao.criar(paciente, autor, dto.texto())
        );
        return toResponse(salva);
    }

    private PacienteObservacaoResponseDTO toResponse(PacienteObservacao obs) {
        return new PacienteObservacaoResponseDTO(
                obs.getId(),
                obs.getPaciente().getId(),
                obs.getTexto(),
                obs.getAutor().getId(),
                obs.getAutor().getNome(),
                obs.getCriadoEm()
        );
    }
}
