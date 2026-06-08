package com.OdontoHelpBackend.service.Consulta;

import com.OdontoHelpBackend.Mapper.AgendamentoMapper;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.OrigemAgendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Consulta.Response.Agendamento.AgendamentoResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteService pacienteService;
    private final DentistaService dentistaService;
    private final AgendamentoMapper agendamentoMapper;


    private static final Set<StatusConsulta> STATUS_TRANSICAO_MANUAL_PERMITIDOS =
        EnumSet.of(StatusConsulta.AGENDADO, StatusConsulta.CONFIRMADO, StatusConsulta.FALTA, StatusConsulta.CANCELADO);

    public AgendamentoResponseDTO buscarPorId(Long id, Usuario usuarioLogado) {
        Agendamento agendamento = buscarEntidadePorId(id);
        validarPropriedade(agendamento, usuarioLogado);
        return agendamentoMapper.toResponse(agendamento);
    }

    public Slice<AgendamentoResponseDTO> listarPorPaciente(Long pacienteId, Pageable pageable) {
        return agendamentoRepository.findByPacienteId(pacienteId, pageable)
                .map(agendamentoMapper::toResponse);
    }

    public Slice<AgendamentoResponseDTO> listarPorDentista(Long dentistaId, Pageable pageable, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            if (!dentistaLogado.getId().equals(dentistaId))
                throw new AcessoNegadoException("Você não tem permissão para ver agenda de outro dentista");
        }

        return agendamentoRepository.findByDentistaId(dentistaId, pageable)
                .map(agendamentoMapper::toResponse);
    }

    @Transactional
    public AgendamentoResponseDTO criar(AgendamentoRequestDTO dto) {
        var paciente = pacienteService.buscarEntidadePorId(dto.pacienteId());
        var dentista = dentistaService.buscarEntidadePorId(dto.dentistaId());

        if (!paciente.getIsAtivo())
            throw new BusinessException("Paciente inativo não pode realizar agendamentos");
        if (!dentista.getIsAtivo())
            throw new BusinessException("Dentista inativo não pode realizar agendamentos");

        Agendamento agendamento = agendamentoMapper.toEntity(dto);
        agendamento.setPaciente(paciente);
        agendamento.setDentista(dentista);
        agendamento.setStatus(StatusConsulta.AGENDADO);
        agendamento.setOrigem(OrigemAgendamento.AGENDADA);

        try {
            validarConflitoHorario(agendamento);
            return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Dentista já possui agendamento neste horário");
        }
    }

    public AgendamentoResponseDTO atualizar(Long id, AgendamentoUpdateDTO dto, Usuario usuarioLogado) {
        Agendamento agendamento = buscarEntidadePorId(id);
        validarPropriedade(agendamento, usuarioLogado);

        if (agendamento.getStatus() == StatusConsulta.CANCELADO
                || agendamento.getStatus() == StatusConsulta.ATENDIDO)
            throw new BusinessException("Agendamento " + agendamento.getStatus() + " não pode ser alterado");

        if (agendamento.getOrigem() == OrigemAgendamento.AVULSA)
            throw new BusinessException("Consulta avulsa não pode ser reagendada");

        agendamentoMapper.updateEntity(dto, agendamento);

        try {
            validarConflitoHorario(agendamento);
            return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Dentista já possui agendamento neste horário");
        }
    }


    public AgendamentoResponseDTO atualizarStatus(Long id, StatusConsulta novoStatus, Usuario usuarioLogado) {
        Agendamento agendamento = buscarEntidadePorId(id);
        validarPropriedade(agendamento, usuarioLogado);

        if (novoStatus == StatusConsulta.ATENDIDO)
            throw new BusinessException("O status ATENDIDO é definido automaticamente ao iniciar o atendimento clínico");

        if (!STATUS_TRANSICAO_MANUAL_PERMITIDOS.contains(novoStatus))
            throw new BusinessException("Transição de status não permitida: " + novoStatus);

        if (agendamento.getStatus() == StatusConsulta.CANCELADO
                || agendamento.getStatus() == StatusConsulta.ATENDIDO)
            throw new BusinessException("Agendamento " + agendamento.getStatus() + " não pode ser alterado");

        agendamento.setStatus(novoStatus);
        return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
    }

    public void cancelar(Long id, Usuario usuarioLogado) {
        Agendamento agendamento = buscarEntidadePorId(id);
        validarPropriedade(agendamento, usuarioLogado);

        if (agendamento.getStatus() == StatusConsulta.ATENDIDO)
            throw new BusinessException("Não é possível cancelar um agendamento que já possui atendimento clínico");
        if (agendamento.getStatus() == StatusConsulta.CANCELADO)
            throw new BusinessException("Agendamento já está cancelado");

        agendamento.setStatus(StatusConsulta.CANCELADO);
        agendamentoRepository.save(agendamento);
    }

    public Slice<AgendamentoResponseDTO> filtrar(
            LocalDateTime dataInicio, LocalDateTime dataFim,
            StatusConsulta status, Long dentistaId, Long pacienteId,
            String nome, Pageable pageable, Usuario usuarioLogado) {

        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentista = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            dentistaId = dentista.getId();
        }

        return agendamentoRepository
                .filtrar(dataInicio, dataFim, status, dentistaId, pacienteId, nome, pageable)
                .map(agendamentoMapper::toResponse);
    }


    public Agendamento buscarEntidadePorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
    }


    private void validarConflitoHorario(Agendamento agendamento) {
        if (agendamento.getOrigem() == OrigemAgendamento.AVULSA)
            return;

        Long dentistaId = agendamento.getDentista().getId();
        boolean conflito = agendamento.getId() == null
                ? agendamentoRepository.existsByDentistaIdAndStatusNotAndDataInicioLessThanAndDataFimGreaterThan(
                        dentistaId, StatusConsulta.CANCELADO, agendamento.getDataFim(), agendamento.getDataInicio())
                : agendamentoRepository.existsByDentistaIdAndIdNotAndStatusNotAndDataInicioLessThanAndDataFimGreaterThan(
                        dentistaId, agendamento.getId(), StatusConsulta.CANCELADO,
                        agendamento.getDataFim(), agendamento.getDataInicio());
        if (conflito)
            throw new ConflictException("Dentista já possui agendamento neste horário");
    }

    private void validarPropriedade(Agendamento agendamento, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.DENTISTA) return;
        Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        if (!agendamento.getDentista().getId().equals(dentistaLogado.getId()))
            throw new AcessoNegadoException("Você não tem permissão para alterar este agendamento");
    }
}
