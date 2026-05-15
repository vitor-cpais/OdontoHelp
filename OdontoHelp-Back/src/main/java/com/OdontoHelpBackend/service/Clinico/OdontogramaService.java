package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.HistoricoOdontograma;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.domain.Clinico.Odontograma;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Clinica.Response.HistoricoOdontogramaResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.OdontogramaResponseDTO;
import com.OdontoHelpBackend.repository.Clinico.HistoricoOdontogramaRepository;
import com.OdontoHelpBackend.repository.Clinico.OdontogramaRepository;
import lombok.RequiredArgsConstructor;
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

    // Chamado pelo AtendimentoService ao FINALIZAR — nunca chamar diretamente do controller
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

        // Grava histórico ANTES de atualizar — registro imutável
        HistoricoOdontograma historico = new HistoricoOdontograma();
        historico.setPaciente(paciente);
        historico.setNumeroDente(item.getNumeroDente());
        historico.setSituacaoAnterior(odontograma.getSituacaoAtual()); // null se primeiro registro
        historico.setSituacaoNova(item.getSituacaoIdentificada());
        historico.setDentista(dentista);
        historico.setAtendimento(atendimento);
        historico.setObservacao(item.getObservacao());
        historicoRepository.save(historico);

        // Atualiza situação atual do dente
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
                h.getAtendimento().getId(),
                h.getObservacao(), h.getRegistradoEm()
        );
    }
}
