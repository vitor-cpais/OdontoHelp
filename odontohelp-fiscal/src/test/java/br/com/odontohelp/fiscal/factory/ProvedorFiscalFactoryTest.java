package br.com.odontohelp.fiscal.factory;

import br.com.odontohelp.fiscal.exception.ProvedorNaoEncontradoException;
import br.com.odontohelp.fiscal.provider.ProvedorFiscal;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProvedorFiscalFactoryTest {

    @Test
    void identificadorExistenteRetornaProvedorCorreto() {
        ProvedorFiscal elotech = mock(ProvedorFiscal.class);
        when(elotech.getIdentificador()).thenReturn("ELOTECH");

        ProvedorFiscalFactory factory = new ProvedorFiscalFactory(List.of(elotech));

        assertThat(factory.getProvedor("elotech")).isSameAs(elotech);
    }

    @Test
    void identificadorInexistenteLancaExcecao() {
        ProvedorFiscalFactory factory = new ProvedorFiscalFactory(List.of());

        assertThatThrownBy(() -> factory.getProvedor("BETHA"))
                .isInstanceOf(ProvedorNaoEncontradoException.class);
    }
}
