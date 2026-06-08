package br.com.odontohelp.fiscal.dto;

import java.time.Instant;

public record ErroResponse(
        Instant timestamp,
        int status,
        String erro,
        String mensagem,
        String path
) {
}
