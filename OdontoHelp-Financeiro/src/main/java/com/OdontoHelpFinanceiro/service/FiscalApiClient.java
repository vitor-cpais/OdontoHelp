package com.OdontoHelpFinanceiro.service;

import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.ConsultaNfseFiscalResponse;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.EmitirNfseFiscalRequest;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.EmitirNfseFiscalResponse;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.FiscalPageResponse;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.RegistrarNfseNumeroFiscalRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class FiscalApiClient {

    private final RestClient restClient;

    public FiscalApiClient(@Value("${app.fiscal-api-url}") String fiscalApiUrl) {
        this.restClient = RestClient.create(fiscalApiUrl);
    }

    public EmitirNfseFiscalResponse emitirNota(EmitirNfseFiscalRequest request, String bearerToken) {
        return restClient.post()
                .uri("/v1/notas")
                .header(HttpHeaders.AUTHORIZATION, bearerToken)
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::tratarErro)
                .body(EmitirNfseFiscalResponse.class);
    }

    public FiscalPageResponse<ConsultaNfseFiscalResponse> listarNotas(String bearerToken, String tenantId,
                                                                        String status, Long pacienteId,
                                                                        String criadoDe, String criadoAte,
                                                                        String numeroNfse,
                                                                        int page, int size) {
        String uri = UriComponentsBuilder.fromPath("/v1/notas")
                .queryParam("tenantId", tenantId)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParamIfPresent("status", java.util.Optional.ofNullable(status).filter(s -> !s.isBlank()))
                .queryParamIfPresent("externalCustomerId", java.util.Optional.ofNullable(pacienteId).map(String::valueOf))
                .queryParamIfPresent("criadoDe", java.util.Optional.ofNullable(criadoDe).filter(s -> !s.isBlank()))
                .queryParamIfPresent("criadoAte", java.util.Optional.ofNullable(criadoAte).filter(s -> !s.isBlank()))
                .queryParamIfPresent("numeroNfse", java.util.Optional.ofNullable(numeroNfse).filter(s -> !s.isBlank()))
                .build()
                .toUriString();

        return restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearerToken)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::tratarErro)
                .body(new ParameterizedTypeReference<>() {});
    }

    public ConsultaNfseFiscalResponse registrarNumero(String nfseId, String tenantId, String nfseNumero,
                                                      String bearerToken) {
        String uri = UriComponentsBuilder.fromPath("/v1/notas/{id}/numero")
                .queryParam("tenantId", tenantId)
                .buildAndExpand(nfseId)
                .toUriString();

        return restClient.put()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearerToken)
                .body(new RegistrarNfseNumeroFiscalRequest(nfseNumero))
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::tratarErro)
                .body(ConsultaNfseFiscalResponse.class);
    }

    private void tratarErro(org.springframework.http.HttpRequest req,
                            org.springframework.http.client.ClientHttpResponse res) {
        try {
            int status = res.getStatusCode().value();
            String body = res.getBody() != null ? new String(res.getBody().readAllBytes()) : "";
            throw new IllegalStateException("Fiscal retornou HTTP " + status + ": " + body);
        } catch (java.io.IOException ex) {
            throw new IllegalStateException("Fiscal retornou erro HTTP", ex);
        }
    }
}
