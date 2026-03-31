package com.OdontoHelpBackend.service.Utils;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ValidacoesService {

    private final UsuarioRepository usuarioRepository;
    private final AgendamentoRepository agendamentoRepository;

    public void validarInativacaoUsuario(Long usuarioId) {
        var statusImpedimento = List.of(StatusConsulta.AGENDADO, StatusConsulta.CONFIRMADO);

        boolean temPendencia = agendamentoRepository.existsByPacienteIdAndStatusIn(usuarioId, statusImpedimento) ||
                agendamentoRepository.existsByDentistaIdAndStatusIn(usuarioId, statusImpedimento);

        if (temPendencia) {
            throw new BusinessException("Não é possível desativar: este usuário possui consultas pendentes.");
        }
    }
}
