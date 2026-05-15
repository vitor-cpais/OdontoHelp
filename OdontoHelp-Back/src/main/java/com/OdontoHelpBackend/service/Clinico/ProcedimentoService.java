package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.Mapper.ProcedimentoMapper;
import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import com.OdontoHelpBackend.dto.Clinica.Request.ProcedimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ProcedimentoResponseDTO;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.ProcedimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcedimentoService {

    private final ProcedimentoRepository procedimentoRepository;
    private final ProcedimentoMapper procedimentoMapper;

    public Slice<ProcedimentoResponseDTO> listar(String nome, Boolean isAtivo, Pageable pageable) {
        if (nome != null && !nome.isBlank())
            return procedimentoRepository.findByNomeContainingIgnoreCase(nome, pageable)
                    .map(procedimentoMapper::toResponse);
        if (isAtivo != null)
            return procedimentoRepository.findByIsAtivo(isAtivo, pageable)
                    .map(procedimentoMapper::toResponse);
        return procedimentoRepository.findAllBy(pageable)
                .map(procedimentoMapper::toResponse);
    }

    public ProcedimentoResponseDTO buscarPorId(Long id) {
        return procedimentoMapper.toResponse(buscarEntidadePorId(id));
    }

    @Transactional
    public ProcedimentoResponseDTO criar(ProcedimentoRequestDTO dto) {
        // Evita duplicidade de nome no catálogo
        if (procedimentoRepository.existsByNomeIgnoreCase(dto.nome()))
            throw new ConflictException("Já existe um procedimento com este nome");

        Procedimento procedimento = procedimentoMapper.toEntity(dto);
        procedimento.setIsAtivo(true);
        return procedimentoMapper.toResponse(procedimentoRepository.save(procedimento));
    }

    @Transactional
    public ProcedimentoResponseDTO atualizar(Long id, ProcedimentoRequestDTO dto) {
        Procedimento procedimento = buscarEntidadePorId(id);

        // Verifica duplicidade de nome apenas se o nome mudou
        if (!procedimento.getNome().equalsIgnoreCase(dto.nome()) &&
                procedimentoRepository.existsByNomeIgnoreCase(dto.nome()))
            throw new ConflictException("Já existe um procedimento com este nome");

        procedimentoMapper.updateEntity(dto, procedimento);
        return procedimentoMapper.toResponse(procedimentoRepository.save(procedimento));
    }

    @Transactional
    public ProcedimentoResponseDTO toggleStatus(Long id, boolean isAtivo) {
        Procedimento procedimento = buscarEntidadePorId(id);
        procedimento.setIsAtivo(isAtivo);
        return procedimentoMapper.toResponse(procedimentoRepository.save(procedimento));
    }

    public Procedimento buscarEntidadePorId(Long id) {
        return procedimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Procedimento não encontrado"));
    }
}
