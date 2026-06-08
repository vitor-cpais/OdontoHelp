package br.com.odontohelp.fiscal.factory;

import br.com.odontohelp.fiscal.exception.ProvedorNaoEncontradoException;
import br.com.odontohelp.fiscal.provider.ProvedorFiscal;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class ProvedorFiscalFactory {

    private final Map<String, ProvedorFiscal> provedores;

    public ProvedorFiscalFactory(List<ProvedorFiscal> provedores) {
        this.provedores = provedores.stream()
                .collect(Collectors.toMap(
                        p -> p.getIdentificador().toUpperCase(),
                        Function.identity()
                ));
    }

    public ProvedorFiscal getProvedor(String identificador) {
        ProvedorFiscal provedor = provedores.get(identificador.toUpperCase());
        if (provedor == null) {
            throw new ProvedorNaoEncontradoException(identificador);
        }
        return provedor;
    }
}
