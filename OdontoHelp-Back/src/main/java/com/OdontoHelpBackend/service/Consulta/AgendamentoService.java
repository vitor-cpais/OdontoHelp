package com.OdontoHelpBackend.service.Consulta;

import com.OdontoHelpBackend.Mapper.AgendamentoMapper;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Consulta.Response.Agendamento.AgendamentoResponseDTO;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteService pacienteService;
    private final DentistaService dentistaService;
    private final AgendamentoMapper agendamentoMapper;



    public AgendamentoResponseDTO buscarPorId(Long id) {
        return agendamentoMapper.toResponse(buscarEntidadePorId(id));
    }

    public Slice<AgendamentoResponseDTO> listarPorPaciente(Long pacienteId, Pageable pageable) {
        return agendamentoRepository.findByPacienteId(pacienteId, pageable)
                .map(agendamentoMapper::toResponse);
    }

    public Slice<AgendamentoResponseDTO> listarPorDentista(Long dentistaId, Pageable pageable) {
        return agendamentoRepository.findByDentistaId(dentistaId, pageable)
                .map(agendamentoMapper::toResponse);
    }

    public AgendamentoResponseDTO criar(AgendamentoRequestDTO dto) {
        Paciente paciente = pacienteService.buscarEntidadePorId(dto.pacienteId());
        Dentista dentista = dentistaService.buscarEntidadePorId(dto.dentistaId());

        if (!paciente.getIsAtivo())
            throw new BusinessException("Paciente inativo não pode realizar agendamentos");
        if (!dentista.getIsAtivo())
            throw new BusinessException("Dentista inativo não pode realizar agendamentos");

        Agendamento agendamento = agendamentoMapper.toEntity(dto);
        agendamento.setPaciente(paciente);
        agendamento.setDentista(dentista);
        agendamento.setStatus(StatusConsulta.AGENDADO);

        validarConflitoHorario(agendamento);

        return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
    }

    public AgendamentoResponseDTO atualizar(Long id, AgendamentoUpdateDTO dto) {
        Agendamento agendamento = buscarEntidadePorId(id);
        if (agendamento.getStatus() == StatusConsulta.CANCELADO)
            throw new BusinessException("Agendamento cancelado não pode ser alterado");
        agendamentoMapper.updateEntity(dto, agendamento);
        validarConflitoHorario(agendamento);
        return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
    }

    public AgendamentoResponseDTO atualizarStatus(Long id, StatusConsulta novoStatus) {
        Agendamento agendamento = buscarEntidadePorId(id);
        if (agendamento.getStatus() == StatusConsulta.CANCELADO)
            throw new BusinessException("Agendamento cancelado não pode ser alterado");
        agendamento.setStatus(novoStatus);
        return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
    }

    public void cancelar(Long id) {
        Agendamento agendamento = buscarEntidadePorId(id);
        if (agendamento.getStatus() == StatusConsulta.CANCELADO)
            throw new BusinessException("Agendamento já está cancelado");
        agendamento.setStatus(StatusConsulta.CANCELADO);
        agendamentoRepository.save(agendamento);
    }

    private Agendamento buscarEntidadePorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
    }

    private void validarConflitoHorario(Agendamento agendamento) {
        boolean conflito = agendamentoRepository
                .existsByDentistaIdAndStatusNotAndDataInicioLessThanAndDataFimGreaterThan(
                        agendamento.getDentista().getId(),
                        StatusConsulta.CANCELADO,
                        agendamento.getDataFim(),
                        agendamento.getDataInicio()
                );
        if (conflito)
            throw new ConflictException("Dentista já possui agendamento neste horário");
    }

    public Slice<AgendamentoResponseDTO> filtrar(
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            StatusConsulta status,
            Long dentistaId,
            Long pacienteId,
            Pageable pageable) {
        return agendamentoRepository.filtrar(dataInicio, dataFim, status != null ? status.name() : null, dentistaId, pacienteId, pageable)
                .map(agendamentoMapper::toResponse);
    }


}
