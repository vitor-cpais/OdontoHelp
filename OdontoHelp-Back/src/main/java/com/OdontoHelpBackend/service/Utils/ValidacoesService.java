package com.OdontoHelpBackend.service.Utils;


import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ValidacoesService {

    private final AgendamentoRepository agendamentoRepository;
    private final AtendimentoRepository atendimentoRepository;

    public void validarInativacaoUsuario(Long usuarioId) {
        // Bloqueia se tiver agendamentos pendentes (MVP 1)
        var statusImpedimento = List.of(StatusConsulta.AGENDADO, StatusConsulta.CONFIRMADO);
        boolean temAgendamentoPendente =
                agendamentoRepository.existsByPacienteIdAndStatusIn(usuarioId, statusImpedimento) ||
                agendamentoRepository.existsByDentistaIdAndStatusIn(usuarioId, statusImpedimento);

        if (temAgendamentoPendente)
            throw new BusinessException("Não é possível desativar: este usuário possui consultas pendentes.");

        // NOVO MVP 2: Bloqueia se tiver atendimentos em aberto
        boolean temAtendimentoAberto =
                atendimentoRepository.existsByPacienteIdAndStatusIn(usuarioId,
                        List.of(StatusAtendimento.EM_ANDAMENTO)) ||
                atendimentoRepository.existsByDentistaIdAndStatusIn(usuarioId,
                        List.of(StatusAtendimento.EM_ANDAMENTO));

        if (temAtendimentoAberto)
            throw new BusinessException("Não é possível desativar: este usuário possui atendimentos em aberto.");
    }
}
