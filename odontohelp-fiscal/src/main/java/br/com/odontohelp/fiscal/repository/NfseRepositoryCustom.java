package br.com.odontohelp.fiscal.repository;

import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

public interface NfseRepositoryCustom {

    Page<Nfse> filtrar(String tenantId,
                       StatusNfse status,
                       String externalCustomerId,
                       Instant criadoDe,
                       Instant criadoAteExclusive,
                       String numeroNfse,
                       Pageable pageable);
}
