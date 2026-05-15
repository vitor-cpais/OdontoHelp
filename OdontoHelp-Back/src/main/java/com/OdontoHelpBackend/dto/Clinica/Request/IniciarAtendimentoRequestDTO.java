package com.OdontoHelpBackend.dto.Clinica.Request;

/**
 * DTO recebido em POST /agendamentos/{id}/iniciar-atendimento.
 *
 * horaInicio NÃO é enviada pelo cliente — o backend usa LocalDateTime.now().
 * itens também não são enviados aqui; procedimentos são adicionados em PUT /atendimentos/{id}.
 * Apenas observações opcionais são aceitas no momento da abertura.
 */
public record IniciarAtendimentoRequestDTO(
        String observacoesGerais   // opcional
) {}
