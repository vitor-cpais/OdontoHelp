package br.com.odontohelp.fiscal.provider.elotech;

import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.exception.ProvedorFiscalException;
import br.com.odontohelp.fiscal.provider.ProvedorFiscal;
import br.com.odontohelp.fiscal.util.AssinaturaDigitalService;
import br.com.odontohelp.fiscal.util.XmlUtil;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

@Service
@Slf4j
@ConditionalOnProperty(name = "fiscal.emissao.modo", havingValue = "AUTOMATICO")
public class ElotechProvedor implements ProvedorFiscal {

    private final ElotechXmlBuilder xmlBuilder;
    private final AssinaturaDigitalService assinaturaService;
    private final ElotechFeignClient feignClient;

    public ElotechProvedor(ElotechXmlBuilder xmlBuilder,
                           AssinaturaDigitalService assinaturaService,
                           ElotechFeignClient feignClient) {
        this.xmlBuilder = xmlBuilder;
        this.assinaturaService = assinaturaService;
        this.feignClient = feignClient;
    }

    @Override
    public String getIdentificador() {
        return "ELOTECH";
    }

    @Override
    @Retry(name = "elotech-soap")
    public String emitir(Nfse nfse) throws ProvedorFiscalException {
        try {
            String loteXml = xmlBuilder.construirLoteRps(nfse);
            String xmlAssinado = assinaturaService.assinar(loteXml);
            String envelope = xmlBuilder.montarEnvelopeSoap(xmlAssinado);
            String resposta = feignClient.enviar(envelope);
            return extrairNumeroNfse(resposta);
        } catch (ProvedorFiscalException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ProvedorFiscalException("SOAP", ex.getMessage());
        }
    }

    private String extrairNumeroNfse(String respostaXml) {
        Document document = XmlUtil.parseSeguro(respostaXml);
        String numero = XmlUtil.textoTag(document, "NumeroNfse");
        if (numero == null || numero.isBlank()) {
            numero = XmlUtil.textoTag(document, "Numero");
        }
        if (numero == null || numero.isBlank()) {
            String codigo = XmlUtil.textoTag(document, "Codigo");
            String mensagem = XmlUtil.textoTag(document, "Mensagem");
            throw new ProvedorFiscalException(
                    codigo == null ? "RESPOSTA_INVALIDA" : codigo,
                    mensagem == null ? "Numero da NFS-e nao encontrado na resposta do provedor" : mensagem
            );
        }
        return numero.trim();
    }
}
