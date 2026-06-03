package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record OdontogramaEntryResponseDTO(
        Long id,
        Integer numeroDente,
        SituacaoDente situacaoAtual,
        String observacao,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime atualizadoEm
) {}
