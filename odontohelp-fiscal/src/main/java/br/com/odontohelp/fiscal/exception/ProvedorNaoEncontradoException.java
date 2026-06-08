package br.com.odontohelp.fiscal.exception;

public class ProvedorNaoEncontradoException extends RuntimeException {

    public ProvedorNaoEncontradoException(String identificador) {
        super("Provedor fiscal nao encontrado: " + identificador);
    }
}
