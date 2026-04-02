package com.OdontoHelpBackend.domain.usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "TB_ENDERECO")
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = true, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String rua;

    @Column(nullable = false, length = 10)
    private String numero;

    @Column(length = 50)
    private String complemento;

    @Column(nullable = false, length = 50)
    private String bairro;

    @Column(nullable = false, length = 50)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String uf;

    @Column(nullable = false, length = 8)
    private String cep;


    @PrePersist
    @PreUpdate
    private void prepararEndereco() {
        if (this.cep != null) this.cep = this.cep.replaceAll("\\D", "");
        if (this.rua != null) this.rua = this.rua.trim().toUpperCase();
        if (this.bairro != null) this.bairro = this.bairro.trim().toUpperCase();
        if (this.cidade != null) this.cidade = this.cidade.trim().toUpperCase();
        if (this.uf != null) this.uf = this.uf.trim().toUpperCase();
        if (this.complemento != null) this.complemento = this.complemento.trim().toUpperCase();
    }
}

