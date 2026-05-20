package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.HistoricoOdontograma;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.domain.Clinico.Odontograma;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Clinica.Request.AtualizarDenteRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.HistoricoOdontogramaResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.OdontogramaResponseDTO;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.HistoricoOdontogramaRepository;
import com.OdontoHelpBackend.repository.Clinico.OdontogramaRepository;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OdontogramaService {

    private final OdontogramaRepository odontogramaRepository;
    private final HistoricoOdontogramaRepository historicoRepository;
    private final PacienteRepository pacienteRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final DentistaRepository dentistaRepository;

    public List<OdontogramaResponseDTO> buscarPorPaciente(Long pacienteId) {
        return odontogramaRepository.findByPacienteId(pacienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Slice<HistoricoOdontogramaResponseDTO> buscarHistorico(Long pacienteId, Pageable pageable) {
        return historicoRepository
                .findByPacienteIdOrderByRegistradoEmDesc(pacienteId, pageable)
                .map(this::toHistoricoResponse);
    }

    public Slice<HistoricoOdontogramaResponseDTO> buscarHistoricoPorDente(
            Long pacienteId, Integer numeroDente, Pageable pageable) {
        return historicoRepository
                .findByPacienteIdAndNumeroDenteOrderByRegistradoEmDesc(pacienteId, numeroDente, pageable)
                .map(this::toHistoricoResponse);
    }

    /**
     * Atualização direta — chamada pelo controller sem necessidade de atendimento formal.
     * Gera histórico com atendimentoId null.
     * O dentista é resolvido externamente (pelo controller) conforme o perfil do usuário logado.
     */
    @Transactional
    public OdontogramaResponseDTO atualizarDiretamente(Long pacienteId, Integer numeroDente,
                                                        AtualizarDenteRequestDTO dto,
                                                        Dentista dentista) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        Odontograma odontograma = odontogramaRepository
                .findByPacienteIdAndNumeroDente(pacienteId, numeroDente)
                .orElseGet(() -> {
                    Odontograma novo = new Odontograma();
                    novo.setPaciente(paciente);
                    novo.setNumeroDente(numeroDente);
                    return novo;
                });

        HistoricoOdontograma historico = new HistoricoOdontograma();
        historico.setPaciente(paciente);
        historico.setNumeroDente(numeroDente);
        historico.setSituacaoAnterior(odontograma.getSituacaoAtual());
        historico.setSituacaoNova(dto.situacaoAtual());
        historico.setDentista(dentista);
        historico.setAtendimento(null);
        historico.setObservacao(dto.observacao());
        historicoRepository.save(historico);

        odontograma.setSituacaoAtual(dto.situacaoAtual());
        odontograma.setObservacao(dto.observacao());
        return toResponse(odontogramaRepository.save(odontograma));
    }

    /**
     * Resolve o dentista responsável para uso pelo ADMIN.
     * Estratégia: último dentista que atendeu o paciente.
     * Fallback: primeiro dentista ativo do sistema.
     */
    public Dentista resolverDentistaResponsavel(Long pacienteId) {
        // Busca o último atendimento do paciente para pegar o dentista
        Slice<Atendimento> atendimentos = atendimentoRepository
                .findByPacienteId(pacienteId, PageRequest.of(0, 1));

        if (atendimentos.hasContent()) {
            return atendimentos.getContent().get(0).getDentista();
        }

        // Fallback: primeiro dentista ativo
        return dentistaRepository.findByIsAtivo(true, PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        "Nenhum dentista ativo encontrado para registrar a alteração"));
    }

    /**
     * Chamado pelo AtendimentoService ao FINALIZAR — nunca chamar diretamente do controller.
     */
    @Transactional
    public void atualizarPorAtendimento(Paciente paciente, ItemAtendimento item,
                                        Dentista dentista, Atendimento atendimento) {
        Odontograma odontograma = odontogramaRepository
                .findByPacienteIdAndNumeroDente(paciente.getId(), item.getNumeroDente())
                .orElseGet(() -> {
                    Odontograma novo = new Odontograma();
                    novo.setPaciente(paciente);
                    novo.setNumeroDente(item.getNumeroDente());
                    return novo;
                });

        HistoricoOdontograma historico = new HistoricoOdontograma();
        historico.setPaciente(paciente);
        historico.setNumeroDente(item.getNumeroDente());
        historico.setSituacaoAnterior(odontograma.getSituacaoAtual());
        historico.setSituacaoNova(item.getSituacaoIdentificada());
        historico.setDentista(dentista);
        historico.setAtendimento(atendimento);
        historico.setObservacao(item.getObservacao());
        historicoRepository.save(historico);

        odontograma.setSituacaoAtual(item.getSituacaoIdentificada());
        odontograma.setObservacao(item.getObservacao());
        odontogramaRepository.save(odontograma);
    }

    private OdontogramaResponseDTO toResponse(Odontograma o) {
        return new OdontogramaResponseDTO(
                o.getId(), o.getNumeroDente(), o.getSituacaoAtual(),
                o.getObservacao(), o.getAtualizadoEm()
        );
    }

    private HistoricoOdontogramaResponseDTO toHistoricoResponse(HistoricoOdontograma h) {
        return new HistoricoOdontogramaResponseDTO(
                h.getId(), h.getNumeroDente(),
                h.getSituacaoAnterior(), h.getSituacaoNova(),
                h.getDentista().getId(), h.getDentista().getNome(),
                h.getAtendimento() != null ? h.getAtendimento().getId() : null,
                h.getObservacao(), h.getRegistradoEm()
        );
    }
}
