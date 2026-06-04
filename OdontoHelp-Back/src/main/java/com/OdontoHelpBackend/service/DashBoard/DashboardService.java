package com.OdontoHelpBackend.service.DashBoard;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Dashboard.Response.AgendamentoStatusDTO;
import com.OdontoHelpBackend.dto.Dashboard.Response.DashboardResumoDTO;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.service.Usuario.DentistaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final DentistaRepository dentistaRepository;
    private final DentistaService dentistaService;

    public DashboardResumoDTO resumo(Usuario usuarioLogado, Long dentistaId) {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime fimDia = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimMes = LocalDate.now().atTime(23, 59, 59);

        Long dentistaFiltroId = resolverDentistaFiltro(usuarioLogado, dentistaId);
        if (dentistaFiltroId != null) {
            Dentista dentista = dentistaService.buscarEntidadePorId(dentistaFiltroId);
            Long agendamentosHoje = agendamentoRepository.countByPeriodoAndDentista(inicioDia, fimDia, dentistaFiltroId);
            Long agendamentosMes = agendamentoRepository.countByPeriodoAndDentista(inicioMes, fimMes, dentistaFiltroId);
            Long pacientes = agendamentoRepository.countPacientesByDentista(dentistaFiltroId);
            Long dentistasAtivos = Boolean.TRUE.equals(dentista.getIsAtivo()) ? 1L : 0L;
            return new DashboardResumoDTO(agendamentosHoje, pacientes, dentistasAtivos, agendamentosMes);
        }

        Long agendamentosHoje = agendamentoRepository.countByPeriodo(inicioDia, fimDia);
        Long pacientesAtivos = pacienteRepository.countByIsAtivo(true);
        Long dentistasAtivos = dentistaRepository.countByIsAtivo(true);
        Long agendamentosMes = agendamentoRepository.countByPeriodo(inicioMes, fimMes);

        return new DashboardResumoDTO(agendamentosHoje, pacientesAtivos, dentistasAtivos, agendamentosMes);
    }

    public List<AgendamentoStatusDTO> agendamentosPorStatus(
            LocalDate dataInicio,
            LocalDate dataFim,
            Long dentistaId,
            Usuario usuarioLogado) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(23, 59, 59);

        List<Object[]> rows;
        Long dentistaFiltroId = resolverDentistaFiltro(usuarioLogado, dentistaId);
        if (dentistaFiltroId != null) {
            rows = agendamentoRepository.countByStatusNoPeriodoAndDentista(inicio, fim, dentistaFiltroId);
        } else {
            rows = agendamentoRepository.countByStatusNoPeriodo(inicio, fim);
        }

        return rows
                .stream()
                .map(row -> new AgendamentoStatusDTO(
                        (StatusConsulta) row[0],
                        (Long) row[1]
                ))
                .toList();
    }

    private Long resolverDentistaFiltro(Usuario usuarioLogado, Long dentistaId) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.DENTISTA) {
            return dentistaService.buscarEntidadePorUsuarioId(usuarioLogado.getId()).getId();
        }
        return dentistaId;
    }
}