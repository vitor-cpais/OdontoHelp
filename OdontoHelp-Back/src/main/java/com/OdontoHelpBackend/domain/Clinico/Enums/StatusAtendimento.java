package com.OdontoHelpBackend.domain.Clinico.Enums;

/**
 * Status do ATENDIMENTO (execução clínica).
 * Ciclo de vida obrigatório: EM_ANDAMENTO → FINALIZADO.
 * Nunca misturar com StatusConsulta (domínio diferente).
 */
public enum StatusAtendimento {

    /**
     * Atendimento criado via "iniciar atendimento" — dentista está atendendo.
     * Procedimentos podem ser adicionados/editados neste estado.
     */
    EM_ANDAMENTO,

    /**
     * Atendimento encerrado. Nenhuma modificação é permitida.
     * Ao finalizar, o odontograma é atualizado e o histórico é gravado.
     */
    FINALIZADO
}
