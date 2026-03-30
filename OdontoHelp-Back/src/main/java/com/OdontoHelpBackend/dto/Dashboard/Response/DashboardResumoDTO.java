package com.OdontoHelpBackend.dto.Dashboard.Response;

public record DashboardResumoDTO(
        Long agendamentosHoje,
        Long pacientesAtivos,
        Long dentistasAtivos,
        Long agendamentosMes
) {}