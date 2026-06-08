package br.com.odontohelp.fiscal.service;

import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import br.com.odontohelp.fiscal.exception.NfseNaoEncontradaException;
import br.com.odontohelp.fiscal.factory.ProvedorFiscalFactory;
import br.com.odontohelp.fiscal.provider.ProvedorFiscal;
import br.com.odontohelp.fiscal.repository.NfseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
public class EmissaoAutomaticaAsyncService {

    private final NfseRepository nfseRepository;
    private final ProvedorFiscalFactory provedorFiscalFactory;

    public EmissaoAutomaticaAsyncService(NfseRepository nfseRepository,
                                         ProvedorFiscalFactory provedorFiscalFactory) {
        this.nfseRepository = nfseRepository;
        this.provedorFiscalFactory = provedorFiscalFactory;
    }

    @Async("fiscalExecutor")
    @Transactional
    public void processarEmissao(UUID nfseId, String tenantId, String provedorIdentificador) {
        Nfse nfse = nfseRepository.findByIdAndTenantId(nfseId, tenantId)
                .orElseThrow(() -> new NfseNaoEncontradaException(nfseId, tenantId));

        nfse.setStatus(StatusNfse.PROCESSANDO);
        nfseRepository.save(nfse);

        try {
            ProvedorFiscal provedor = provedorFiscalFactory.getProvedor(provedorIdentificador);
            String numero = provedor.emitir(nfse);
            nfse.setNfseNumero(numero);
            nfse.setStatus(StatusNfse.EMITIDA);
            nfse.setMensagemErro(null);
        } catch (Exception ex) {
            log.error("Falha na emissao automatica nfseId={} tenantId={}: {}", nfseId, tenantId, ex.getMessage(), ex);
            nfse.setStatus(StatusNfse.ERRO);
            nfse.setMensagemErro(ex.getMessage());
        }

        nfseRepository.save(nfse);
    }
}
