package com.OdontoHelpBackend.dto.Clinica.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AtendimentoPendenteCobrancaDTO(
        Long atendimentoId,
        Long pacienteId,
        String pacienteNome,
        String dentistaNome,
        LocalDateTime horaFim,
        List<ItemPendenteCobrancaDTO> itensPendentes,
        BigDecimal totalPendente
) {}
