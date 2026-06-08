package com.OdontoHelpFinanceiro.service;

public record PagamentoConfirmadoEvent(Long pagamentoId, String bearerToken) {
}
