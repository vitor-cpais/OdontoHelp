package com.OdontoHelpFinanceiro.domain;

import com.OdontoHelpFinanceiro.util.SensitiveDataConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cliente_financeiro")
@Getter
@Setter
@NoArgsConstructor
public class ClienteFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paciente_id_externo", nullable = false)
    private Long pacienteIdExterno;

    @Column(nullable = false)
    private String nome;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "cpf_encrypted", length = 512)
    private String cpf;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "email_encrypted", length = 512)
    private String email;

    @Convert(converter = SensitiveDataConverter.class)
    @Column(name = "telefone_encrypted", length = 512)
    private String telefone;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    public void touch() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
