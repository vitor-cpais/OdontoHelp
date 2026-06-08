package com.OdontoHelpFinanceiro.service;

import com.OdontoHelpFinanceiro.domain.enums.StatusFinanceiro;
import com.OdontoHelpFinanceiro.dto.DtoRecords.ClienteSnapshotDTO;
import com.OdontoHelpFinanceiro.dto.DtoRecords.LembreteCobrancaEmailRequest;
import com.OdontoHelpFinanceiro.infra.exception.BusinessException;
import com.OdontoHelpFinanceiro.infra.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class CoreApiClient {

    @Value("${app.core-api-url}")
    private String coreApiUrl;

    public ClienteSnapshotDTO buscarPaciente(Long pacienteId, String bearerToken) {
        try {
            return RestClient.create(coreApiUrl)
                    .get()
                    .uri("/pacientes/{id}/snapshot-financeiro", pacienteId)
                    .header(HttpHeaders.AUTHORIZATION, bearerToken)
                    .retrieve()
                    .body(ClienteSnapshotDTO.class);
        } catch (Exception e) {
            throw new BusinessException("Nao foi possivel validar paciente no sistema principal");
        }
    }

    public void marcarItemCobrado(Long itemAtendimentoId, Long cobrancaId, String bearerToken) {
        try {
            RestClient.create(coreApiUrl)
                    .patch()
                    .uri("/atendimentos/itens/{id}/marcar-cobrado", itemAtendimentoId)
                    .header(HttpHeaders.AUTHORIZATION, bearerToken)
                    .body(new MarcarCobradoBody(cobrancaId))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new BusinessException("Cobranca criada, mas falha ao atualizar item de atendimento");
        }
    }

    public void enviarLembreteCobranca(LembreteCobrancaEmailRequest req, String bearerToken) {
        try {
            RestClient.create(coreApiUrl)
                    .post()
                    .uri("/notificacoes/cobranca/lembrete-email")
                    .header(HttpHeaders.AUTHORIZATION, bearerToken)
                    .body(req)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new BusinessException("Nao foi possivel enviar lembrete por e-mail");
        }
    }

    private record MarcarCobradoBody(Long financeiroCobrancaId) {}
}
