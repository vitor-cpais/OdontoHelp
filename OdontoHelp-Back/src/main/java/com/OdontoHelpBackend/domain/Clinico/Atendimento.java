package com.OdontoHelpBackend.domain.Clinico;

import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa a EXECUÇÃO CLÍNICA de um agendamento.
 * Criado exclusivamente via Agendamento#iniciarAtendimento().
 * Procedimentos só podem ser adicionados/removidos enquanto EM_ANDAMENTO.
 */
@Entity
@Table(name = "TB_ATENDIMENTO")
@Getter
@NoArgsConstructor
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Relação 1:1 obrigatória — Atendimento nunca existe sem Agendamento. */
    @OneToOne
    @JoinColumn(name = "agendamento_id", nullable = false, unique = true)
    private Agendamento agendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dentista_id", nullable = false)
    private Dentista dentista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(nullable = false)
    private LocalDateTime horaInicio;

    private LocalDateTime horaFim;

    @Column(columnDefinition = "TEXT")
    private String observacoesGerais;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAtendimento status;

    @OneToMany(mappedBy = "atendimento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemAtendimento> itens = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    // ─── Métodos de domínio ──────────────────────────────────────────────────

    /**
     * Construtor de domínio — chamado apenas por Agendamento#iniciarAtendimento().
     * Garante que o estado inicial é sempre EM_ANDAMENTO.
     */
    public static Atendimento iniciar(Agendamento agendamento, Dentista dentista, String observacoesGerais) {
        Atendimento a = new Atendimento();
        a.agendamento  = agendamento;
        a.dentista     = dentista;
        a.paciente     = agendamento.getPaciente();
        a.horaInicio   = LocalDateTime.now();
        a.status       = StatusAtendimento.EM_ANDAMENTO;
        a.observacoesGerais = observacoesGerais;
        return a;
    }

    /**
     * Adiciona um procedimento ao atendimento.
     * Só é permitido enquanto EM_ANDAMENTO.
     */
    public void adicionarItem(ItemAtendimento item) {
        validarEdicaoPermitida();
        item.vincularAtendimento(this);
        this.itens.add(item);
    }

    /**
     * Remove todos os itens e adiciona os novos (usado na atualização completa).
     */
    public void substituirItens(List<ItemAtendimento> novosItens) {
        validarEdicaoPermitida();
        this.itens.clear();
        novosItens.forEach(item -> {
            item.vincularAtendimento(this);
            this.itens.add(item);
        });
    }

    /**
     * Finaliza o atendimento. Registra horaFim. Após isso nenhuma edição é permitida.
     */
    public void finalizar() {
        if (this.status == StatusAtendimento.FINALIZADO)
            throw new BusinessException("Atendimento já está finalizado");
        this.status  = StatusAtendimento.FINALIZADO;
        this.horaFim = LocalDateTime.now();
    }

    /** Permite atualizar apenas observações (sem alterar itens). */
    public void atualizarObservacoes(String observacoes) {
        validarEdicaoPermitida();
        this.observacoesGerais = observacoes;
    }

    // ─── Invariantes ─────────────────────────────────────────────────────────

    private void validarEdicaoPermitida() {
        if (this.status == StatusAtendimento.FINALIZADO)
            throw new BusinessException("Não é permitido modificar um atendimento finalizado");
    }
}
