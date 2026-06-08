package br.com.odontohelp.fiscal.exception;

import lombok.Getter;

@Getter
public class ProvedorFiscalException extends RuntimeException {

    private final String codigoFiscal;

    public ProvedorFiscalException(String codigoFiscal, String descricao) {
        super(descricao);
        this.codigoFiscal = codigoFiscal;
    }
}
