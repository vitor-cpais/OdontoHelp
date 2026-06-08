package br.com.odontohelp.fiscal.domain;

import br.com.odontohelp.fiscal.dto.StatusNfse;
import br.com.odontohelp.fiscal.util.SensitiveDataConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tb_nfse")
@Getter
@Setter
@NoArgsConstructor
public class Nfse {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "external_charge_id", nullable = false, length = 100)
    private String externalChargeId;

    @Column(name = "external_customer_id", nullable = false, length = 100)
    private String externalCustomerId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(name = "descricao_servico", nullable = false, columnDefinition = "TEXT")
    private String descricaoServico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusNfse status = StatusNfse.PENDENTE;

    @Column(name = "nfse_numero", length = 50)
    private String nfseNumero;

    @Column(name = "mensagem_erro", columnDefinition = "TEXT")
    private String mensagemErro;

    @Enumerated(EnumType.STRING)
    @Column(name = "modo_emissao", nullable = false, length = 20)
    private ModoEmissao modoEmissao;

    @Column(name = "tomador_nome", nullable = false, length = 255)
    private String tomadorNome;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_cpf_cnpj_encrypted", length = 512)
    private String tomadorCpfCnpj;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_email_encrypted", length = 512)
    private String tomadorEmail;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_logradouro_encrypted", length = 512)
    private String tomadorLogradouro;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_numero_encrypted", length = 512)
    private String tomadorNumero;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_bairro_encrypted", length = 512)
    private String tomadorBairro;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_municipio_encrypted", length = 512)
    private String tomadorMunicipio;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_uf_encrypted", length = 16)
    private String tomadorUf;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "tomador_cep_encrypted", length = 512)
    private String tomadorCep;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    void prePersist() {
        if (criadoEm == null) {
            criadoEm = Instant.now();
        }
    }
}
