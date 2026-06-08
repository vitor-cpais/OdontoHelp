package com.OdontoHelpFinanceiro.service;

import com.OdontoHelpFinanceiro.domain.ClienteFinanceiro;
import com.OdontoHelpFinanceiro.domain.Cobranca;
import com.OdontoHelpFinanceiro.domain.Pagamento;
import com.OdontoHelpFinanceiro.domain.ParcelaReceber;
import com.OdontoHelpFinanceiro.domain.enums.FormaPagamento;
import com.OdontoHelpFinanceiro.domain.enums.StatusPagamento;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.EmitirNfseFiscalRequest;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.EmitirNfseFiscalResponse;
import com.OdontoHelpFinanceiro.repository.PagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FiscalEmissaoServiceTest {

    @Mock
    private PagamentoRepository pagamentoRepository;

    @Mock
    private FiscalApiClient fiscalApiClient;

    private FiscalEmissaoService service;

    @BeforeEach
    void setUp() {
        service = new FiscalEmissaoService(pagamentoRepository, fiscalApiClient, true, "12345678000199");
    }

    @Test
    void emiteNotaAposPagamentoConfirmado() {
        Pagamento pagamento = pagamento(1L, new BigDecimal("250.00"));
        when(pagamentoRepository.findByIdComDetalhes(1L)).thenReturn(Optional.of(pagamento));
        when(fiscalApiClient.emitirNota(any(EmitirNfseFiscalRequest.class), eq("Bearer token")))
                .thenReturn(new EmitirNfseFiscalResponse(
                        "nfse-uuid", "12345678000199", "PENDENTE", "Aguardando", null, Instant.now()));

        service.onPagamentoConfirmado(new PagamentoConfirmadoEvent(1L, "Bearer token"));

        ArgumentCaptor<EmitirNfseFiscalRequest> captor = ArgumentCaptor.forClass(EmitirNfseFiscalRequest.class);
        verify(fiscalApiClient).emitirNota(captor.capture(), eq("Bearer token"));
        EmitirNfseFiscalRequest request = captor.getValue();
        assertThat(request.externalChargeId()).isEqualTo("1");
        assertThat(request.externalCustomerId()).isEqualTo("42");
        assertThat(request.valor()).isEqualByComparingTo("250.00");
        assertThat(request.tomador().nome()).isEqualTo("Maria Silva");
        assertThat(request.tomador().cpfCnpj()).isEqualTo("12345678901");
    }

    @Test
    void naoEmiteQuandoIntegracaoDesabilitada() {
        FiscalEmissaoService disabled = new FiscalEmissaoService(pagamentoRepository, fiscalApiClient, false, "12345678000199");

        disabled.onPagamentoConfirmado(new PagamentoConfirmadoEvent(1L, "Bearer token"));

        verify(fiscalApiClient, never()).emitirNota(any(), any());
    }

    private Pagamento pagamento(Long id, BigDecimal valor) {
        ClienteFinanceiro cliente = new ClienteFinanceiro();
        cliente.setPacienteIdExterno(42L);
        cliente.setNome("Maria Silva");
        cliente.setCpf("123.456.789-01");
        cliente.setEmail("maria@email.com");

        Cobranca cobranca = new Cobranca();
        cobranca.setCliente(cliente);
        cobranca.setDescricao("Tratamento odontologico");

        ParcelaReceber parcela = new ParcelaReceber();
        parcela.setCobranca(cobranca);

        Pagamento pagamento = new Pagamento();
        pagamento.setId(id);
        pagamento.setParcela(parcela);
        pagamento.setValor(valor);
        pagamento.setDataPagamento(LocalDate.now());
        pagamento.setFormaPagamento(FormaPagamento.PIX);
        pagamento.setStatus(StatusPagamento.CONFIRMADO);
        return pagamento;
    }
}
