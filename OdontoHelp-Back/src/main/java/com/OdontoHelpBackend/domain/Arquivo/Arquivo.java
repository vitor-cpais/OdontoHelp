package com.OdontoHelpBackend.domain.Arquivo;

import com.OdontoHelpBackend.domain.Arquivo.Enums.TipoArquivo;
import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "TB_ARQUIVO")
@Getter
@Setter
@NoArgsConstructor
public class Arquivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_id")
    private Atendimento atendimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TipoArquivo tipo;

    @Column(name = "nome_original", nullable = false)
    private String nomeOriginal;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;

    @Column(name = "storage_key", nullable = false, unique = true, length = 500)
    private String storageKey;

    @Column(length = 500)
    private String descricao;

    @Column(name = "numero_dente")
    private Integer numeroDente;

    @Column(nullable = false)
    private boolean principal = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criado_por_id", nullable = false)
    private Usuario criadoPor;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false, nullable = false)
    private Instant criadoEm;
}
