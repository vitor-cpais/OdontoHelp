package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.util.SensitiveDataConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "envio_lembrete_cobranca")
@Getter
@Setter
@NoArgsConstructor
public class EnvioLembreteCobranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parcela_id", nullable = false)
    private Long parcelaId;

    @Column(nullable = false, length = 20)
    private String canal;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "destino_encrypted", length = 512)
    private String destino;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
