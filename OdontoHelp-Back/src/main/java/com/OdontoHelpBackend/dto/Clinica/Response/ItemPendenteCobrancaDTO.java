package com.OdontoHelpBackend.dto.Clinica.Response;

import java.math.BigDecimal;

public record ItemPendenteCobrancaDTO(
        Long itemId,
        Long procedimentoId,
        String procedimentoNome,
        Integer numeroDente,
        BigDecimal valorCobradoSnapshot
) {}
