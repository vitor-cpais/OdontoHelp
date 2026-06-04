package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.Mapper.PlanoDeTratamentoMapper;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.PlanoDeTratamento;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Clinica.Request.PlanoDeTratamentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPlanoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.PlanoDeTratamentoResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.ItemPlanoDeTratamentoRepository;
import com.OdontoHelpBackend.repository.Clinico.PlanoDeTratamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanoDeTratamentoService {

    private final PlanoDeTratamentoRepository planoRepository;
    private final PlanoDeTratamentoMapper planoMapper;
    private final DentistaService dentistaService;
    private final PacienteService pacienteService;
    private final AtendimentoService atendimentoService;
    private final ProcedimentoService procedimentoService;
    private final ItemPlanoDeTratamentoRepository itemPlanoRepository;
    private final DentistaRepository dentistaRepository;

    public Slice<PlanoDeTratamentoResponseDTO> listarPorPaciente(Long pacienteId, Pageable pageable) {
        return planoRepository.findByPacienteId(pacienteId, pageable)
                .map(planoMapper::toResponse);
    }

    public PlanoDeTratamentoResponseDTO buscarPorId(Long id) {
        return planoMapper.toResponse(buscarEntidadePorId(id));
    }

    public List<ItemPlanoResponseDTO> listarItensPendentes(Long pacienteId) {
        return itemPlanoRepository
                .findByPacienteIdAndStatus(pacienteId, StatusItemPlano.PENDENTE)
                .stream()
                .map(item -> new ItemPlanoResponseDTO(
                        item.getId(),
                        item.getProcedimento().getId(),
                        item.getProcedimento().getNome(),
                        item.getNumeroDente(),
                        item.getPrioridade(),
                        item.getStatus(),
                        item.getObservacao(),
                        item.getAtendimentoRealizacao() != null ? item.getAtendimentoRealizacao().getId() : null
                ))
                .toList();
    }

    @Transactional
    public PlanoDeTratamentoResponseDTO criar(PlanoDeTratamentoRequestDTO dto, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode criar planos de tratamento");

        PlanoDeTratamento plano = planoRepository.findFirstByPacienteIdOrderByCriadoEmAsc(dto.pacienteId())
                .orElseGet(() -> {
                    PlanoDeTratamento novo = planoMapper.toEntity(dto);
                    novo.setPaciente(pacienteService.buscarEntidadePorId(dto.pacienteId()));
                    novo.setDentista(resolverDentista(usuarioLogado, dto.dentistaId()));
                    if (dto.atendimentoId() != null)
                        novo.setAtendimento(atendimentoService.buscarEntidadePorId(dto.atendimentoId()));
                    return planoRepository.save(novo);
                });

        if (dto.observacoes() != null)
            plano.setObservacoes(dto.observacoes());

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            List<ItemPlanoDeTratamento> itens = new ArrayList<>();
            for (var itemDto : dto.itens()) {
                ItemPlanoDeTratamento item = planoMapper.itemToEntity(itemDto);
                item.setPlano(plano);
                item.setProcedimento(procedimentoService.buscarEntidadePorId(itemDto.procedimentoId()));
                item.setStatus(StatusItemPlano.PENDENTE);
                itens.add(item);
            }
            plano.getItens().addAll(itens);
        }

        return planoMapper.toResponse(planoRepository.save(plano));
    }

    @Transactional
    public PlanoDeTratamentoResponseDTO atualizarObservacoes(Long id, String observacoes, Usuario usuarioLogado) {
        PlanoDeTratamento plano = buscarEntidadePorId(id);
        validarPropriedade(plano, usuarioLogado);
        plano.setObservacoes(observacoes);
        return planoMapper.toResponse(planoRepository.save(plano));
    }

    @Transactional
    public PlanoDeTratamentoResponseDTO atualizarStatusItem(Long planoId, Long itemId,
                                                             StatusItemPlano novoStatus,
                                                             Long atendimentoRealizacaoId,
                                                             Usuario usuarioLogado) {
        PlanoDeTratamento plano = buscarEntidadePorId(planoId);
        validarPropriedade(plano, usuarioLogado);

        ItemPlanoDeTratamento item = plano.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Item do plano não encontrado"));

        if (item.getStatus() == StatusItemPlano.REALIZADO)
            throw new BusinessException("Item já foi realizado e não pode ser alterado");

        item.setStatus(novoStatus);

        if (novoStatus == StatusItemPlano.REALIZADO) {
            if (atendimentoRealizacaoId != null) {
                item.setAtendimentoRealizacao(atendimentoService.buscarEntidadePorId(atendimentoRealizacaoId));
            }
        } else {
            item.setAtendimentoRealizacao(null);
        }

        return planoMapper.toResponse(planoRepository.save(plano));
    }

    public PlanoDeTratamentoResponseDTO buscarPlanoUnicoPorPaciente(Long pacienteId, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode acessar plano de tratamento");

        return planoRepository.findFirstByPacienteIdOrderByCriadoEmAsc(pacienteId)
                .map(planoMapper::toResponse)
                .orElseGet(() -> criarPlanoVazio(pacienteId, usuarioLogado));
    }

    @Transactional
    public PlanoDeTratamentoResponseDTO criarPlanoVazio(Long pacienteId, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode criar planos de tratamento");

        PlanoDeTratamento plano = new PlanoDeTratamento();
        plano.setPaciente(pacienteService.buscarEntidadePorId(pacienteId));
        plano.setDentista(resolverDentista(usuarioLogado, null));
        return planoMapper.toResponse(planoRepository.save(plano));
    }

    public PlanoDeTratamento buscarEntidadePorId(Long id) {
        return planoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Plano de tratamento não encontrado"));
    }

    private void validarPropriedade(PlanoDeTratamento plano, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.DENTISTA) return;
        Dentista dentistaLogado = dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        if (!plano.getDentista().getId().equals(dentistaLogado.getId()))
            throw new AcessoNegadoException("Você não tem permissão para alterar este plano de tratamento");
    }

    private Dentista resolverDentista(Usuario usuarioLogado, Long dentistaId) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA)
            return dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        if (dentistaId != null)
            return dentistaService.buscarEntidadePorId(dentistaId);
        return dentistaRepository.findByIsAtivo(true, PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException("Nenhum dentista ativo disponível"));
    }
}
