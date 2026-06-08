package br.com.odontohelp.fiscal.service;

import br.com.odontohelp.fiscal.domain.ModoEmissao;
import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.dto.EmitirNfseRequest;
import br.com.odontohelp.fiscal.dto.EmitirNfseResponse;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import br.com.odontohelp.fiscal.dto.TomadorDto;
import br.com.odontohelp.fiscal.factory.ProvedorFiscalFactory;
import br.com.odontohelp.fiscal.provider.ProvedorFiscal;
import br.com.odontohelp.fiscal.repository.NfseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NfseServiceTest {

    @Mock
    private NfseRepository nfseRepository;

    @Mock
    private EmissaoAutomaticaAsyncService emissaoAutomaticaAsyncService;

    @Mock
    private ProvedorFiscalFactory provedorFiscalFactory;

    @Mock
    private ProvedorFiscal provedorFiscal;

    private NfseService nfseServiceManual;

    @BeforeEach
    void setUp() {
        nfseServiceManual = new NfseService(nfseRepository, emissaoAutomaticaAsyncService, "MANUAL", "ELOTECH");
    }

    @Test
    void modoManualPersistePendenteSemChamarProvedor() {
        EmitirNfseRequest request = requestValido();
        when(nfseRepository.save(any(Nfse.class))).thenAnswer(invocation -> {
            Nfse nfse = invocation.getArgument(0);
            nfse.setId(UUID.randomUUID());
            return nfse;
        });

        EmitirNfseResponse response = nfseServiceManual.emitir(request, "12345678000199");

        ArgumentCaptor<Nfse> captor = ArgumentCaptor.forClass(Nfse.class);
        verify(nfseRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(StatusNfse.PENDENTE);
        assertThat(captor.getValue().getModoEmissao()).isEqualTo(ModoEmissao.MANUAL);
        assertThat(response.status()).isEqualTo("PENDENTE");
        verify(emissaoAutomaticaAsyncService, never()).processarEmissao(any(), any(), any());
    }

    @Test
    void modoAutomaticoDisparaProcessamentoAssincrono() {
        NfseService nfseServiceAutomatico = new NfseService(
                nfseRepository, emissaoAutomaticaAsyncService, "AUTOMATICO", "ELOTECH");
        EmitirNfseRequest request = requestValido();
        UUID id = UUID.randomUUID();

        when(nfseRepository.save(any(Nfse.class))).thenAnswer(invocation -> {
            Nfse nfse = invocation.getArgument(0);
            nfse.setId(id);
            return nfse;
        });

        nfseServiceAutomatico.emitir(request, "12345678000199");

        verify(emissaoAutomaticaAsyncService).processarEmissao(id, "12345678000199", "ELOTECH");
    }

    @Test
    void falhaNoProvedorDefineStatusErro() {
        UUID id = UUID.randomUUID();
        Nfse nfse = new Nfse();
        nfse.setId(id);
        nfse.setTenantId("12345678000199");
        nfse.setStatus(StatusNfse.PENDENTE);

        when(nfseRepository.findByIdAndTenantId(id, "12345678000199")).thenReturn(Optional.of(nfse));
        when(provedorFiscalFactory.getProvedor("ELOTECH")).thenReturn(provedorFiscal);
        when(provedorFiscal.emitir(nfse)).thenThrow(new RuntimeException("Falha SOAP"));

        EmissaoAutomaticaAsyncService asyncService = new EmissaoAutomaticaAsyncService(nfseRepository, provedorFiscalFactory);
        asyncService.processarEmissao(id, "12345678000199", "ELOTECH");

        ArgumentCaptor<Nfse> captor = ArgumentCaptor.forClass(Nfse.class);
        verify(nfseRepository, org.mockito.Mockito.atLeast(2)).save(captor.capture());
        Nfse salva = captor.getAllValues().get(captor.getAllValues().size() - 1);
        assertThat(salva.getStatus()).isEqualTo(StatusNfse.ERRO);
        assertThat(salva.getMensagemErro()).contains("Falha SOAP");
    }

    @Test
    void modoAutomaticoComSucessoDefineEmitida() throws Exception {
        UUID id = UUID.randomUUID();
        Nfse nfse = new Nfse();
        nfse.setId(id);
        nfse.setTenantId("12345678000199");
        nfse.setStatus(StatusNfse.PENDENTE);

        when(nfseRepository.findByIdAndTenantId(id, "12345678000199")).thenReturn(Optional.of(nfse));
        when(provedorFiscalFactory.getProvedor("ELOTECH")).thenReturn(provedorFiscal);
        when(provedorFiscal.emitir(nfse)).thenReturn("2026000001");

        EmissaoAutomaticaAsyncService asyncService = new EmissaoAutomaticaAsyncService(nfseRepository, provedorFiscalFactory);
        asyncService.processarEmissao(id, "12345678000199", "ELOTECH");

        ArgumentCaptor<Nfse> captor = ArgumentCaptor.forClass(Nfse.class);
        verify(nfseRepository, org.mockito.Mockito.atLeast(2)).save(captor.capture());
        Nfse salva = captor.getAllValues().get(captor.getAllValues().size() - 1);
        assertThat(salva.getStatus()).isEqualTo(StatusNfse.EMITIDA);
        assertThat(salva.getNfseNumero()).isEqualTo("2026000001");
    }

    private EmitirNfseRequest requestValido() {
        return new EmitirNfseRequest(
                "12345678000199",
                "pagamento-1",
                "cliente-1",
                new BigDecimal("150.00"),
                "Servico odontologico",
                new TomadorDto("Maria Silva", "12345678901", "maria@email.com", null)
        );
    }
}
