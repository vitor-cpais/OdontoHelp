package com.OdontoHelpBackend.dto.Clinica.Response;

import com.OdontoHelpBackend.domain.Clinico.Enums.FaceDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;

/**
 * Response de item com objeto Procedimento completo (id + nome).
 * Nunca retornar apenas procedimentoId — o frontend precisa exibir o nome sem fetch extra.
 */
public record ItemAtendimentoResponseDTO(
        Long id,
        Long procedimentoId,
        String procedimentoNome,    // ← nome do procedimento sempre presente
        Integer numeroDente,
        FaceDente face,
        SituacaoDente situacaoIdentificada,
        String observacao
) {}
