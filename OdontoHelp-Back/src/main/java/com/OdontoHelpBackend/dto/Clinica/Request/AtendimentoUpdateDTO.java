package com.OdontoHelpBackend.dto.Clinica.Request;

import jakarta.validation.Valid;
import java.util.List;


public record AtendimentoUpdateDTO(
        String observacoesGerais,
        @Valid List<ItemAtendimentoRequestDTO> itens
) {}
