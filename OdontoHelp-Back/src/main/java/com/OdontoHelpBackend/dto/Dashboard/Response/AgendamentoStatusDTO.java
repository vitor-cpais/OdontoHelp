package com.OdontoHelpBackend.dto.Dashboard.Response;

import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;

public record AgendamentoStatusDTO(
        StatusConsulta status,
        Long total
) {}