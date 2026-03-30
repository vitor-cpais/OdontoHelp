package com.OdontoHelpBackend.service.DashBoard;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.dto.Dashboard.Response.AgendamentoStatusDTO;
import com.OdontoHelpBackend.dto.Dashboard.Response.DashboardResumoDTO;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
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

    public DashboardResumoDTO resumo() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime fimDia = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimMes = LocalDate.now().atTime(23, 59, 59);

        Long agendamentosHoje = agendamentoRepository.countByPeriodo(inicioDia, fimDia);
        Long pacientesAtivos = pacienteRepository.countByIsAtivo(true);
        Long dentistasAtivos = dentistaRepository.countByIsAtivo(true);
        Long agendamentosMes = agendamentoRepository.countByPeriodo(inicioMes, fimMes);

        return new DashboardResumoDTO(agendamentosHoje, pacientesAtivos, dentistasAtivos, agendamentosMes);
    }

    public List<AgendamentoStatusDTO> agendamentosPorStatus(LocalDate dataInicio, LocalDate dataFim) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(23, 59, 59);

        return agendamentoRepository.countByStatusNoPeriodo(inicio, fim)
                .stream()
                .map(row -> new AgendamentoStatusDTO(
                        (StatusConsulta) row[0],
                        (Long) row[1]
                ))
                .toList();
    }
}