package br.com.odontohelp.fiscal.provider;

import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.exception.ProvedorFiscalException;

// Para adicionar suporte a outro municipio, crie uma classe no pacote provider/novo/,
// implemente esta interface e anote com @Service. Nenhuma outra alteracao e necessaria.
public interface ProvedorFiscal {

    String getIdentificador();

    String emitir(Nfse nfse) throws ProvedorFiscalException;
}
