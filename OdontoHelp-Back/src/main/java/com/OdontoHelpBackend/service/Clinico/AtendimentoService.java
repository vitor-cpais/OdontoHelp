package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.Mapper.AtendimentoMapper;
import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.IniciarAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.ItemPlanoDeTratamentoRepository;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.service.Consulta.AgendamentoService;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AtendimentoMapper atendimentoMapper;
    private final AgendamentoService agendamentoService;
    private final DentistaService dentistaService;
    private final ProcedimentoService procedimentoService;
    private final OdontogramaService odontogramaService;
    private final ItemPlanoDeTratamentoRepository itemPlanoRepository;

    public AtendimentoResponseDTO buscarPorId(Long id) {
        return atendimentoMapper.toResponse(buscarEntidadePorId(id));
    }

    public Slice<AtendimentoResponseDTO> listarPorPaciente(Long pacienteId, Pageable pageable, Usuario usuarioLogado) {
        return atendimentoRepository.findByPacienteId(pacienteId, pageable)
                .map(atendimentoMapper::toResponse);
    }

    public Slice<AtendimentoResponseDTO> listarPorDentista(
            Long dentistaId, String nomePaciente,
            LocalDateTime dataInicio, LocalDateTime dataFim,
            StatusAtendimento status, Pageable pageable, Usuario usuarioLogado) {

        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            if (!dentistaLogado.getId().equals(dentistaId))
                throw new AcessoNegadoException("Você não tem permissão para ver atendimentos de outro dentista");
        }

        return atendimentoRepository
                .filtrarPorDentista(dentistaId, nomePaciente, dataInicio, dataFim, status, pageable)
                .map(atendimentoMapper::toResponse);
    }

    public Slice<AtendimentoResponseDTO> listarTodos(
            String nomePaciente, LocalDateTime dataInicio,
            LocalDateTime dataFim, StatusAtendimento status, Pageable pageable) {
        return atendimentoRepository
                .filtrarTodos(nomePaciente, dataInicio, dataFim, status, pageable)
                .map(atendimentoMapper::toResponse);
    }

    @Transactional
    public AtendimentoResponseDTO iniciarAtendimento(Long agendamentoId,
                                                      IniciarAtendimentoRequestDTO dto,
                                                      Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode iniciar atendimentos clínicos");

        if (atendimentoRepository.existsByAgendamentoId(agendamentoId))
            throw new ConflictException("Já existe um atendimento para este agendamento");

        Agendamento agendamento = agendamentoService.buscarEntidadePorId(agendamentoId);

        if (agendamento.getStatus() != StatusConsulta.AGENDADO
                && agendamento.getStatus() != StatusConsulta.CONFIRMADO) {
            throw new BusinessException(
                "Não é possível iniciar atendimento para um agendamento com status: "
                + agendamento.getStatus().getDescricao());
        }

        Dentista dentista = resolverDentista(usuarioLogado, agendamento);
        String observacoes = dto != null ? dto.observacoesGerais() : null;
        Atendimento atendimento = Atendimento.iniciar(agendamento, dentista, observacoes);

        agendamento.setStatus(StatusConsulta.ATENDIDO);
        agendamentoRepository.save(agendamento);

        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public AtendimentoResponseDTO atualizar(Long id, AtendimentoUpdateDTO dto, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        if (dto.observacoesGerais() != null)
            atendimento.atualizarObservacoes(dto.observacoesGerais());

        if (dto.itens() != null) {
            List<ItemAtendimento> novosItens = montarItens(dto.itens(), atendimento);
            atendimento.substituirItens(novosItens);
        }

        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public AtendimentoResponseDTO finalizarAtendimento(Long id, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        atendimento.finalizar();

        Long pacienteId = atendimento.getPaciente().getId();

        atendimento.getItens().forEach(item -> {
            odontogramaService.atualizarPorAtendimento(
                atendimento.getPaciente(),
                item,
                atendimento.getDentista(),
                atendimento
            );
            marcarItensPlanoComoRealizados(pacienteId, item.getNumeroDente(), atendimento);
        });

        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    public Atendimento buscarEntidadePorId(Long id) {
        return atendimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Atendimento não encontrado"));
    }

    private void marcarItensPlanoComoRealizados(Long pacienteId, Integer numeroDente, Atendimento atendimento) {
        List<ItemPlanoDeTratamento> itensPendentes = itemPlanoRepository
                .findByPacienteIdAndNumeroDenteAndStatus(pacienteId, numeroDente, StatusItemPlano.PENDENTE);

        itensPendentes.forEach(item -> {
            item.setStatus(StatusItemPlano.REALIZADO);
            item.setAtendimentoRealizacao(atendimento);
        });

        if (!itensPendentes.isEmpty()) {
            itemPlanoRepository.saveAll(itensPendentes);
        }
    }

    private List<ItemAtendimento> montarItens(List<ItemAtendimentoRequestDTO> dtos, Atendimento atendimento) {
        List<ItemAtendimento> itens = new ArrayList<>();
        for (ItemAtendimentoRequestDTO dto : dtos) {
            ItemAtendimento item = atendimentoMapper.itemToEntity(dto);
            item.setProcedimento(procedimentoService.buscarEntidadePorId(dto.procedimentoId()));
            itens.add(item);
        }
        return itens;
    }

    private void validarPropriedadeAtendimento(Atendimento atendimento, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.DENTISTA) return;
        Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        if (!atendimento.getDentista().getId().equals(dentistaLogado.getId()))
            throw new AcessoNegadoException("Você não tem permissão para alterar este atendimento");
    }

    private Dentista resolverDentista(Usuario usuarioLogado, Agendamento agendamento) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            if (!agendamento.getDentista().getId().equals(dentistaLogado.getId()))
                throw new AcessoNegadoException("Você não pode iniciar atendimento para consulta de outro dentista");
            return dentistaLogado;
        }
        return agendamento.getDentista();
    }
}
