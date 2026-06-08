package com.OdontoHelpBackend.dto.Arquivo;

import com.OdontoHelpBackend.domain.Arquivo.Enums.TipoArquivo;

import java.time.Instant;

public record ArquivoResponseDTO(
        Long id,
        Long pacienteId,
        Long atendimentoId,
        TipoArquivo tipo,
        String nomeOriginal,
        String mimeType,
        Long tamanhoBytes,
        String descricao,
        Integer numeroDente,
        boolean principal,
        String criadoPorNome,
        Instant criadoEm,
        String urlAcesso
) {}
