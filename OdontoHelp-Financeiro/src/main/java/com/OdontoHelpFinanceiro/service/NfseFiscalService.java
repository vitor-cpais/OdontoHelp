package com.OdontoHelpFinanceiro.service;

import com.OdontoHelpFinanceiro.domain.Pagamento;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.ConsultaNfseFiscalResponse;
import com.OdontoHelpFinanceiro.dto.FiscalDtoRecords.FiscalPageResponse;
import com.OdontoHelpFinanceiro.dto.ResponseRecords.NfseConfigResponse;
import com.OdontoHelpFinanceiro.dto.ResponseRecords.NfseFiscalResponse;
import com.OdontoHelpFinanceiro.infra.exception.BusinessException;
import com.OdontoHelpFinanceiro.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class NfseFiscalService {

    private final FiscalApiClient fiscalApiClient;
    private final PagamentoRepository pagamentoRepository;
    private final boolean fiscalEnabled;
    private final String fiscalTenantId;
    private final String modoEmissao;
    private final String portalOxyUrl;
    private final String emissorRazaoSocial;
    private final String emissorCnpj;

    public NfseFiscalService(FiscalApiClient fiscalApiClient,
                             PagamentoRepository pagamentoRepository,
                             @Value("${app.fiscal.enabled:false}") boolean fiscalEnabled,
                             @Value("${app.fiscal.tenant-id:}") String fiscalTenantId,
                             @Value("${app.fiscal.modo-emissao:MANUAL}") String modoEmissao,
                             @Value("${app.fiscal.portal-url:}") String portalOxyUrl,
                             @Value("${app.fiscal.emissor-razao-social:}") String emissorRazaoSocial,
                             @Value("${app.fiscal.emissor-cnpj:}") String emissorCnpj) {
        this.fiscalApiClient = fiscalApiClient;
        this.pagamentoRepository = pagamentoRepository;
        this.fiscalEnabled = fiscalEnabled;
        this.fiscalTenantId = fiscalTenantId == null ? "" : fiscalTenantId.trim();
        this.modoEmissao = modoEmissao;
        this.portalOxyUrl = portalOxyUrl;
        this.emissorRazaoSocial = emissorRazaoSocial;
        this.emissorCnpj = emissorCnpj;
    }

    public NfseConfigResponse config() {
        return new NfseConfigResponse(
                fiscalEnabled && !fiscalTenantId.isBlank(),
                modoEmissao,
                portalOxyUrl == null || portalOxyUrl.isBlank() ? null : portalOxyUrl.trim(),
                emissorRazaoSocial == null || emissorRazaoSocial.isBlank() ? null : emissorRazaoSocial.trim(),
                mascararCnpj(emissorCnpj)
        );
    }

    public Page<NfseFiscalResponse> listar(String status,
                                             Long pacienteId,
                                             java.time.LocalDate criadoDe,
                                             java.time.LocalDate criadoAte,
                                             String numeroNfse,
                                             Pageable pageable,
                                             String bearerToken) {
        validarIntegracao(bearerToken);
        FiscalPageResponse<ConsultaNfseFiscalResponse> pagina = fiscalApiClient.listarNotas(
                bearerToken,
                fiscalTenantId,
                status,
                pacienteId,
                criadoDe != null ? criadoDe.toString() : null,
                criadoAte != null ? criadoAte.toString() : null,
                numeroNfse,
                pageable.getPageNumber(),
                pageable.getPageSize()
        );
        List<NfseFiscalResponse> content = pagina.content().stream()
                .map(this::enriquecer)
                .toList();
        return new PageImpl<>(content, pageable, pagina.totalElements());
    }

    public NfseFiscalResponse registrarNumero(String nfseId, String nfseNumero, String bearerToken) {
        validarIntegracao(bearerToken);
        ConsultaNfseFiscalResponse response = fiscalApiClient.registrarNumero(
                nfseId, fiscalTenantId, nfseNumero, bearerToken);
        return enriquecer(response);
    }

    private NfseFiscalResponse enriquecer(ConsultaNfseFiscalResponse r) {
        DadosPagamento dados = buscarDadosPagamento(r.externalChargeId());
        return NfseFiscalResponse.from(
                r,
                dados.pacienteNome(),
                dados.descricaoServico(),
                dados.valor()
        );
    }

    private DadosPagamento buscarDadosPagamento(String externalChargeId) {
        try {
            Long pagamentoId = Long.parseLong(externalChargeId);
            Optional<Pagamento> pagamento = pagamentoRepository.findByIdComDetalhes(pagamentoId);
            if (pagamento.isEmpty()) {
                return DadosPagamento.vazio();
            }
            var cobranca = pagamento.get().getParcela().getCobranca();
            return new DadosPagamento(
                    cobranca.getCliente().getNome(),
                    cobranca.getDescricao(),
                    pagamento.get().getValor()
            );
        } catch (NumberFormatException ex) {
            return DadosPagamento.vazio();
        }
    }

    private void validarIntegracao(String bearerToken) {
        if (!fiscalEnabled) {
            throw new BusinessException("Integracao fiscal desabilitada");
        }
        if (fiscalTenantId.isBlank()) {
            throw new BusinessException("Tenant fiscal nao configurado (FINANCEIRO_FISCAL_TENANT_ID)");
        }
        if (bearerToken == null || bearerToken.isBlank()) {
            throw new BusinessException("Token de autenticacao ausente");
        }
    }

    private String mascararCnpj(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) {
            return null;
        }
        String digits = cnpj.replaceAll("\\D", "");
        if (digits.length() != 14) {
            return "**.***.***/****-**";
        }
        return "**." + digits.substring(2, 5) + "." + digits.substring(5, 8) + "/***" + digits.substring(12) + "**";
    }

    private record DadosPagamento(String pacienteNome, String descricaoServico, BigDecimal valor) {
        static DadosPagamento vazio() {
            return new DadosPagamento(null, null, null);
        }
    }
}
