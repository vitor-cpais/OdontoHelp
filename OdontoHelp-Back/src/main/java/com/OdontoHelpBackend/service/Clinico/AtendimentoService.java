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
import com.OdontoHelpBackend.dto.Clinica.Request.BaixaPlanoManualRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.IniciarAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoUpdateResultDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPlanoResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.ItemAtendimentoRepository;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private final ItemAtendimentoRepository itemAtendimentoRepository;

    public AtendimentoResponseDTO buscarPorId(Long id, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);
        return atendimentoMapper.toResponse(atendimento);
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
            LocalDateTime dataFim, StatusAtendimento status, Pageable pageable, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
            return atendimentoRepository
                    .filtrarPorDentista(dentistaLogado.getId(), nomePaciente, dataInicio, dataFim, status, pageable)
                    .map(atendimentoMapper::toResponse);
        }

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

        odontogramaService.garantirSnapshotInicialSeNecessario(agendamento.getPaciente().getId());

        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public AtendimentoUpdateResultDTO atualizar(Long id, AtendimentoUpdateDTO dto, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        if (dto.observacoesGerais() != null)
            atendimento.atualizarObservacoes(dto.observacoesGerais());

        List<ItemPlanoResponseDTO> baixaManual = new ArrayList<>();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            Set<String> existentes = new HashSet<>();
            atendimento.getItens().forEach(i ->
                    existentes.add(chave(i.getNumeroDente(), i.getProcedimento().getId())));

            for (ItemAtendimentoRequestDTO itemDto : dto.itens()) {
                String key = chave(itemDto.numeroDente(), itemDto.procedimentoId());
                if (existentes.contains(key)) continue;

                ItemAtendimento item = atendimentoMapper.itemToEntity(itemDto);
                item.definirProcedimentoCobravel(procedimentoService.buscarEntidadePorId(itemDto.procedimentoId()));
                atendimento.adicionarItem(item);

                odontogramaService.registrarPorItemAtendimento(
                        atendimento.getPaciente(), item, atendimento, usuarioLogado);

                baixaAutomatica(atendimento, item);
                baixaManual.addAll(buscarItensBaixaManual(
                        atendimento.getPaciente().getId(),
                        item.getNumeroDente(),
                        item.getProcedimento().getId()
                ));

                existentes.add(key);
            }
        }

        Atendimento salvo = atendimentoRepository.save(atendimento);
        return new AtendimentoUpdateResultDTO(
                atendimentoMapper.toResponse(salvo),
                baixaManual.stream().distinct().toList()
        );
    }

    @Transactional
    public AtendimentoResponseDTO finalizarAtendimento(Long id, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);
        atendimento.finalizar();
        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public void removerItem(Long atendimentoId, Long itemId, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(atendimentoId);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        ItemAtendimento item = itemAtendimentoRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item de atendimento não encontrado"));

        if (!item.getAtendimento().getId().equals(atendimentoId))
            throw new BusinessException("Item não pertence a este atendimento");

        if (atendimento.getStatus() == StatusAtendimento.FINALIZADO)
            throw new BusinessException("Não é permitido remover item de um atendimento finalizado");

        atendimento.getItens().remove(item);
        itemAtendimentoRepository.delete(item);
        atendimentoRepository.save(atendimento);
    }

    @Transactional
    public AtendimentoResponseDTO marcarOdontogramaRevisado(Long id, boolean revisado, Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(id);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);
        atendimento.marcarOdontogramaRevisado(revisado);
        return atendimentoMapper.toResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional
    public AtendimentoResponseDTO baixaPlanoManual(Long atendimentoId, BaixaPlanoManualRequestDTO dto,
                                                    Usuario usuarioLogado) {
        Atendimento atendimento = buscarEntidadePorId(atendimentoId);
        validarPropriedadeAtendimento(atendimento, usuarioLogado);

        for (Long itemPlanoId : dto.itemPlanoIds()) {
            ItemPlanoDeTratamento item = itemPlanoRepository.findById(itemPlanoId)
                    .orElseThrow(() -> new NotFoundException("Item do plano não encontrado"));

            if (item.getStatus() == StatusItemPlano.REALIZADO)
                throw new BusinessException("Item do plano já foi realizado");

            item.setStatus(StatusItemPlano.REALIZADO);
            item.setAtendimentoRealizacao(atendimento);
            itemPlanoRepository.save(item);
        }

        return atendimentoMapper.toResponse(atendimento);
    }

    public Atendimento buscarEntidadePorId(Long id) {
        return atendimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Atendimento não encontrado"));
    }

    private void baixaAutomatica(Atendimento atendimento, ItemAtendimento item) {
        itemPlanoRepository
                .findByPacienteIdAndNumeroDenteAndProcedimentoIdAndStatus(
                        atendimento.getPaciente().getId(),
                        item.getNumeroDente(),
                        item.getProcedimento().getId(),
                        StatusItemPlano.PENDENTE
                )
                .forEach(planoItem -> {
                    planoItem.setStatus(StatusItemPlano.REALIZADO);
                    planoItem.setAtendimentoRealizacao(atendimento);
                    itemPlanoRepository.save(planoItem);
                });
    }

    private List<ItemPlanoResponseDTO> buscarItensBaixaManual(Long pacienteId, Integer numeroDente, Long procedimentoId) {
        return itemPlanoRepository
                .findByPacienteIdAndNumeroDenteAndStatus(pacienteId, numeroDente, StatusItemPlano.PENDENTE)
                .stream()
                .filter(i -> !i.getProcedimento().getId().equals(procedimentoId))
                .map(i -> new ItemPlanoResponseDTO(
                        i.getId(),
                        i.getProcedimento().getId(),
                        i.getProcedimento().getNome(),
                        i.getNumeroDente(),
                        i.getPrioridade(),
                        i.getStatus(),
                        i.getObservacao(),
                        i.getAtendimentoRealizacao() != null ? i.getAtendimentoRealizacao().getId() : null
                ))
                .toList();
    }

    private static String chave(Integer dente, Long procedimentoId) {
        return dente + ":" + procedimentoId;
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
