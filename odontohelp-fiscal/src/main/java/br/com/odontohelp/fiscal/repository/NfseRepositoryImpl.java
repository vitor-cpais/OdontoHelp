package br.com.odontohelp.fiscal.repository;

import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class NfseRepositoryImpl implements NfseRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Nfse> filtrar(String tenantId,
                              StatusNfse status,
                              String externalCustomerId,
                              Instant criadoDe,
                              Instant criadoAteExclusive,
                              String numeroNfse,
                              Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Nfse> query = cb.createQuery(Nfse.class);
        Root<Nfse> root = query.from(Nfse.class);

        List<Predicate> predicates = buildPredicates(
                cb, root, tenantId, status, externalCustomerId, criadoDe, criadoAteExclusive, numeroNfse);
        query.where(predicates.toArray(Predicate[]::new));
        applySort(cb, query, root, pageable);

        TypedQuery<Nfse> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        List<Nfse> content = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Nfse> countRoot = countQuery.from(Nfse.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(buildPredicates(
                cb, countRoot, tenantId, status, externalCustomerId, criadoDe, criadoAteExclusive, numeroNfse
        ).toArray(Predicate[]::new));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private static List<Predicate> buildPredicates(CriteriaBuilder cb,
                                                   Root<Nfse> root,
                                                   String tenantId,
                                                   StatusNfse status,
                                                   String externalCustomerId,
                                                   Instant criadoDe,
                                                   Instant criadoAteExclusive,
                                                   String numeroNfse) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("tenantId"), tenantId));
        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }
        if (externalCustomerId != null) {
            predicates.add(cb.equal(root.get("externalCustomerId"), externalCustomerId));
        }
        if (criadoDe != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("criadoEm"), criadoDe));
        }
        if (criadoAteExclusive != null) {
            predicates.add(cb.lessThan(root.get("criadoEm"), criadoAteExclusive));
        }
        if (numeroNfse != null && !numeroNfse.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("nfseNumero")), "%" + numeroNfse.toLowerCase() + "%"));
        }
        return predicates;
    }

    private static void applySort(CriteriaBuilder cb,
                                  CriteriaQuery<Nfse> query,
                                  Root<Nfse> root,
                                  Pageable pageable) {
        if (pageable.getSort().isEmpty()) {
            query.orderBy(cb.desc(root.get("criadoEm")));
            return;
        }
        List<jakarta.persistence.criteria.Order> orders = new ArrayList<>();
        for (Sort.Order order : pageable.getSort()) {
            if (order.isAscending()) {
                orders.add(cb.asc(root.get(order.getProperty())));
            } else {
                orders.add(cb.desc(root.get(order.getProperty())));
            }
        }
        query.orderBy(orders);
    }
}
