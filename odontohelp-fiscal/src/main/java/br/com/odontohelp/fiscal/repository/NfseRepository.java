package br.com.odontohelp.fiscal.repository;

import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface NfseRepository extends JpaRepository<Nfse, UUID>, NfseRepositoryCustom {

    Optional<Nfse> findByIdAndTenantId(UUID id, String tenantId);

    boolean existsById(UUID id);

    Page<Nfse> findAllByTenantIdAndStatus(String tenantId, StatusNfse status, Pageable pageable);

    Page<Nfse> findAllByTenantId(String tenantId, Pageable pageable);

    Page<Nfse> filtrar(String tenantId,
                       StatusNfse status,
                       String externalCustomerId,
                       Instant criadoDe,
                       Instant criadoAteExclusive,
                       String numeroNfse,
                       Pageable pageable);
}
