package br.com.odontohelp.fiscal.exception;

import java.util.UUID;

public class NfseNaoEncontradaException extends RuntimeException {

    public NfseNaoEncontradaException(UUID id, String tenantId) {
        super("Nota fiscal nao encontrada: id=" + id + ", tenantId=" + tenantId);
    }
}
