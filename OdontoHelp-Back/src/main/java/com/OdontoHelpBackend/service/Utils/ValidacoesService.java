package com.OdontoHelpBackend.service.Utils;


import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ValidacoesService {

    private final AgendamentoRepository agendamentoRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final UsuarioRepository usuarioRepository;

    public void validarNaoAutoInativar(Long alvoUsuarioId, Usuario usuarioLogado) {
        if (usuarioLogado != null && usuarioLogado.getId().equals(alvoUsuarioId)) {
            throw new BusinessException("Você não pode desativar o próprio acesso.");
        }
    }

    public void validarUltimoAdminAtivo(Usuario usuarioAlvo) {
        if (usuarioAlvo.getPerfil() != PerfilUsuario.ADMIN || !Boolean.TRUE.equals(usuarioAlvo.getIsAtivo())) {
            return;
        }
        long adminsAtivos = usuarioRepository.countByPerfilAndIsAtivo(PerfilUsuario.ADMIN, true);
        if (adminsAtivos <= 1) {
            throw new BusinessException("Não é possível desativar o último administrador ativo do sistema.");
        }
    }

    public void validarInativacaoUsuario(Long usuarioId) {
        var statusImpedimento = List.of(StatusConsulta.AGENDADO, StatusConsulta.CONFIRMADO);
        boolean temAgendamentoPendente =
                agendamentoRepository.existsByPacienteIdAndStatusIn(usuarioId, statusImpedimento) ||
                agendamentoRepository.existsByDentistaIdAndStatusIn(usuarioId, statusImpedimento);

        if (temAgendamentoPendente)
            throw new BusinessException("Não é possível desativar: este usuário possui consultas pendentes.");

        boolean temAtendimentoAberto =
                atendimentoRepository.existsByPacienteIdAndStatusIn(usuarioId,
                        List.of(StatusAtendimento.EM_ANDAMENTO)) ||
                atendimentoRepository.existsByDentistaIdAndStatusIn(usuarioId,
                        List.of(StatusAtendimento.EM_ANDAMENTO));

        if (temAtendimentoAberto)
            throw new BusinessException("Não é possível desativar: este usuário possui atendimentos em aberto.");
    }
}
