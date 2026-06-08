package com.OdontoHelpFinanceiro.service;

import com.OdontoHelpFinanceiro.domain.ClienteFinanceiro;
import com.OdontoHelpFinanceiro.domain.Cobranca;
import com.OdontoHelpFinanceiro.domain.Pagamento;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.EmitirNfseFiscalRequest;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.EmitirNfseFiscalResponse;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.TomadorFiscalDto;
import com.OdontoHelpFinanceiro.infra.exception.NotFoundException;
import com.OdontoHelpFinanceiro.repository.PagamentoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@Slf4j
public class FiscalEmissaoService {

    private final PagamentoRepository pagamentoRepository;
    private final FiscalApiClient fiscalApiClient;
    private final boolean fiscalEnabled;
    private final String fiscalTenantId;

    public FiscalEmissaoService(PagamentoRepository pagamentoRepository,
                                FiscalApiClient fiscalApiClient,
                                @Value("${app.fiscal.enabled:false}") boolean fiscalEnabled,
                                @Value("${app.fiscal.tenant-id:}") String fiscalTenantId) {
        this.pagamentoRepository = pagamentoRepository;
        this.fiscalApiClient = fiscalApiClient;
        this.fiscalEnabled = fiscalEnabled;
        this.fiscalTenantId = fiscalTenantId == null ? "" : fiscalTenantId.trim();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPagamentoConfirmado(PagamentoConfirmadoEvent event) {
        if (!fiscalEnabled) {
            return;
        }
        if (fiscalTenantId.isBlank()) {
            log.warn("Integracao fiscal habilitada, mas app.fiscal.tenant-id nao configurado. Pagamento id={}", event.pagamentoId());
            return;
        }
        if (event.bearerToken() == null || event.bearerToken().isBlank()) {
            log.warn("Token ausente para emissao fiscal do pagamento id={}", event.pagamentoId());
            return;
        }

        try {
            emitirPorPagamento(event.pagamentoId(), event.bearerToken());
        } catch (Exception ex) {
            log.error("Falha ao solicitar NFS-e no Fiscal para pagamento id={}: {}", event.pagamentoId(), ex.getMessage(), ex);
        }
    }

    void emitirPorPagamento(Long pagamentoId, String bearerToken) {
        Pagamento pagamento = pagamentoRepository.findByIdComDetalhes(pagamentoId)
                .orElseThrow(() -> new NotFoundException("Pagamento nao encontrado"));

        Cobranca cobranca = pagamento.getParcela().getCobranca();
        ClienteFinanceiro cliente = cobranca.getCliente();

        EmitirNfseFiscalRequest request = new EmitirNfseFiscalRequest(
                fiscalTenantId,
                String.valueOf(pagamento.getId()),
                String.valueOf(cliente.getPacienteIdExterno()),
                pagamento.getValor(),
                cobranca.getDescricao(),
                montarTomador(cliente)
        );

        EmitirNfseFiscalResponse response = fiscalApiClient.emitirNota(request, bearerToken);
        log.info("NFS-e solicitada no Fiscal: pagamentoId={} nfseId={} status={}",
                pagamentoId, response.id(), response.status());
    }

    private TomadorFiscalDto montarTomador(ClienteFinanceiro cliente) {
        return new TomadorFiscalDto(
                cliente.getNome(),
                sanitizarCpfCnpj(cliente.getCpf()),
                cliente.getEmail(),
                null
        );
    }

    private String sanitizarCpfCnpj(String cpfCnpj) {
        if (cpfCnpj == null || cpfCnpj.isBlank()) {
            return null;
        }
        String digits = cpfCnpj.replaceAll("\\D", "");
        return digits.isBlank() ? null : digits;
    }
}
