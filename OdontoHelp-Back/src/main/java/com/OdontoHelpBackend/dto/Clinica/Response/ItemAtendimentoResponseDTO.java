package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusCobrancaItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ItemAtendimentoResponseDTO(
        Long id,
        Long procedimentoId,
        String procedimentoNome,
        BigDecimal valorCobradoSnapshot,
        StatusCobrancaItem statusCobranca,
        String financeiroCobrancaId,
        LocalDateTime cobrancaEnviadaEm,
        Integer numeroDente,
        SituacaoDente situacaoNova,
        String observacao
) {}
