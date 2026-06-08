package br.com.odontohelp.fiscal.controller;

import br.com.odontohelp.fiscal.config.FilterConfig;
import br.com.odontohelp.fiscal.config.JwtBlacklistService;
import br.com.odontohelp.fiscal.config.JwtService;
import br.com.odontohelp.fiscal.service.NfseService;
import br.com.odontohelp.fiscal.exception.GlobalExceptionHandler;
import br.com.odontohelp.fiscal.exception.OperacaoInvalidaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = NfseController.class)
@Import({GlobalExceptionHandler.class, FilterConfig.class, JwtService.class})
class NfseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NfseService nfseService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtBlacklistService jwtBlacklistService;

    @BeforeEach
    void configurarBlacklist() {
        when(jwtBlacklistService.estaBloqueado(anyString())).thenReturn(false);
    }

    @Test
    void postSemTokenRetorna401() throws Exception {
        String body = """
                {
                  "tenantId": "12345678000199",
                  "externalChargeId": "pag-1",
                  "externalCustomerId": "cli-1",
                  "valor": 100.00,
                  "descricaoServico": "Servico",
                  "tomador": { "nome": "Joao" }
                }
                """;

        mockMvc.perform(post("/v1/notas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void postComBodyInvalidoRetorna400() throws Exception {
        when(jwtService.tokenValido("token-valido")).thenReturn(true);

        String body = """
                {
                  "tenantId": "",
                  "externalChargeId": "pag-1",
                  "externalCustomerId": "cli-1",
                  "valor": -1,
                  "descricaoServico": "",
                  "tomador": { "nome": "" }
                }
                """;

        mockMvc.perform(post("/v1/notas")
                        .header("Authorization", "Bearer token-valido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").exists());
    }

    @Test
    void putNumeroEmNotaJaEmitidaRetorna422() throws Exception {
        UUID id = UUID.randomUUID();
        when(jwtService.tokenValido("token-valido")).thenReturn(true);
        when(nfseService.registrarNumero(eq(id), eq("tenant-a"), eq("999")))
                .thenThrow(new OperacaoInvalidaException("Somente notas PENDENTE podem receber numero manual"));

        mockMvc.perform(put("/v1/notas/{id}/numero", id)
                        .header("Authorization", "Bearer token-valido")
                        .param("tenantId", "tenant-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nfseNumero\":\"999\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void getDeOutroTenantRetorna404() throws Exception {
        UUID id = UUID.randomUUID();
        when(jwtService.tokenValido("token-valido")).thenReturn(true);
        when(nfseService.consultar(id, "tenant-b"))
                .thenThrow(new br.com.odontohelp.fiscal.exception.NfseNaoEncontradaException(id, "tenant-b"));

        mockMvc.perform(get("/v1/notas/{id}", id)
                        .header("Authorization", "Bearer token-valido")
                        .param("tenantId", "tenant-b"))
                .andExpect(status().isNotFound());
    }
}
