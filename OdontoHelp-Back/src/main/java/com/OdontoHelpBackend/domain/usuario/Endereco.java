package com.OdontoHelpBackend.domain.usuario;

import jakarta.persistence.*;

import lombok.*;


@Entity
@Table(name = "TB_ENDERECO")
@Getter @Setter @NoArgsConstructor
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String rua;

    @Column(nullable = false)
    private String numero;

    private String complemento;

    @Column(nullable = false)
    private String bairro;

    @Column(nullable = false)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String uf;

    @Column(nullable = false, length = 8)
    private String cep;

    @Column(nullable = false)
    private Boolean isPrincipal = false;
}
