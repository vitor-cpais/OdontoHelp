package com.OdontoHelpBackend.dto.notificacao;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LembreteCobrancaEmailRequest(
        @NotBlank @Email String email,
        @NotBlank String pacienteNome,
        @NotNull @DecimalMin("0.01") BigDecimal valor,
        @NotNull LocalDate dataVencimento,
        String descricao,
        Long parcelaId
) {}
