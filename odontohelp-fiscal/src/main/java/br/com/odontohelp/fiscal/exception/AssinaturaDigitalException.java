package br.com.odontohelp.fiscal.exception;

public class AssinaturaDigitalException extends RuntimeException {

    public AssinaturaDigitalException(String mensagem) {
        super(mensagem);
    }

    public AssinaturaDigitalException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}
