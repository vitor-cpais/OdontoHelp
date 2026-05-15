package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.Mapper.PlanoDeTratamentoMapper;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.PlanoDeTratamento;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Clinica.Request.PlanoDeTratamentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.PlanoDeTratamentoResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.PlanoDeTratamentoRepository;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import lombok.RequiredArgsConstructor;
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

    public Slice<PlanoDeTratamentoResponseDTO> listarPorPaciente(Long pacienteId, Pageable pageable) {
        return planoRepository.findByPacienteId(pacienteId, pageable)
                .map(planoMapper::toResponse);
    }

    public PlanoDeTratamentoResponseDTO buscarPorId(Long id) {
        return planoMapper.toResponse(buscarEntidadePorId(id));
    }

    @Transactional
    public PlanoDeTratamentoResponseDTO criar(PlanoDeTratamentoRequestDTO dto, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.RECEPCAO)
            throw new AcessoNegadoException("Recepcionista não pode criar planos de tratamento");

        PlanoDeTratamento plano = planoMapper.toEntity(dto);
        plano.setPaciente(pacienteService.buscarEntidadePorId(dto.pacienteId()));

        // CORRIGIDO: DENTISTA usa o próprio id, ADMIN usa o dentistaId do DTO
        plano.setDentista(resolverDentista(usuarioLogado, dto.dentistaId()));

        if (dto.atendimentoId() != null)
            plano.setAtendimento(atendimentoService.buscarEntidadePorId(dto.atendimentoId()));

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            // CORRIGIDO: usando ArrayList mutável em vez de toList() imutável
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

        if (novoStatus == StatusItemPlano.REALIZADO && atendimentoRealizacaoId != null)
            item.setAtendimentoRealizacao(atendimentoService.buscarEntidadePorId(atendimentoRealizacaoId));

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

    // CORRIGIDO: DENTISTA usa o próprio id, ADMIN usa o dentistaId explícito do DTO
    private Dentista resolverDentista(Usuario usuarioLogado, Long dentistaId) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA)
            return dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId());
        return dentistaService.buscarEntidadePorId(dentistaId);
    }
}
