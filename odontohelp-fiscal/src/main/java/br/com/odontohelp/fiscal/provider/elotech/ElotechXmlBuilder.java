package br.com.odontohelp.fiscal.provider.elotech;

import br.com.odontohelp.fiscal.config.EmissorProperties;
import br.com.odontohelp.fiscal.domain.Nfse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@ConditionalOnProperty(name = "fiscal.emissao.modo", havingValue = "AUTOMATICO")
public class ElotechXmlBuilder {

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final EmissorProperties emissor;

    public ElotechXmlBuilder(EmissorProperties emissor) {
        this.emissor = emissor;
    }

    public String construirLoteRps(Nfse nfse) {
        String valorServicos = nfse.getValor().setScale(2, RoundingMode.HALF_UP).toPlainString();
        String aliquota = emissor.getAliquotaIss() == null || emissor.getAliquotaIss().isBlank()
                ? "0.00"
                : emissor.getAliquotaIss();
        String dataEmissao = DATA.format(LocalDate.now());
        String cpfCnpjTomador = nfse.getTomadorCpfCnpj() == null ? "" : nfse.getTomadorCpfCnpj();
        String cpfCnpjEmissor = sanitizarNumeros(emissor.getCnpj());

        // Estrutura obrigatoria conforme Manual de Integracao NFS-e Nacional ABRASF 2.03.
        // O atributo Id="lote1" e necessario para que a assinatura XML referencie o elemento correto via URI="#lote1".
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xml.append("<EnviarLoteRpsEnvio xmlns=\"http://www.abrasf.org.br/nfse.xsd\">");
        xml.append("<LoteRps Id=\"lote1\" versao=\"2.03\">");
        xml.append("<NumeroLote>1</NumeroLote>");
        xml.append("<CpfCnpj><Cnpj>").append(cpfCnpjEmissor).append("</Cnpj></CpfCnpj>");
        xml.append("<InscricaoMunicipal>").append(emissor.getInscricaoMunicipal()).append("</InscricaoMunicipal>");
        xml.append("<QuantidadeRps>1</QuantidadeRps>");
        xml.append("<ListaRps>");
        xml.append("<Rps>");
        xml.append("<InfRps Id=\"rps1\">");
        xml.append("<IdentificacaoRps><Numero>1</Numero><Serie>1</Serie><Tipo>1</Tipo></IdentificacaoRps>");
        xml.append("<DataEmissao>").append(dataEmissao).append("</DataEmissao>");
        xml.append("<NaturezaOperacao>1</NaturezaOperacao>");
        String regime = emissor.getRegimeTributario();
        if (regime == null || regime.isBlank()) {
            regime = "1";
        }
        xml.append("<RegimeEspecialTributacao>").append(regime).append("</RegimeEspecialTributacao>");
        xml.append("<OptanteSimplesNacional>1</OptanteSimplesNacional>");
        xml.append("<IncentivadorCultural>2</IncentivadorCultural>");
        xml.append("<Status>1</Status>");
        xml.append("<Servico>");
        xml.append("<Valores>");
        xml.append("<ValorServicos>").append(valorServicos).append("</ValorServicos>");
        xml.append("<IssRetido>2</IssRetido>");
        xml.append("<ValorIss>").append("0.00").append("</ValorIss>");
        xml.append("<Aliquota>").append(aliquota).append("</Aliquota>");
        xml.append("</Valores>");
        xml.append("<ItemListaServico>").append(emissor.getCodigoServicoLc116()).append("</ItemListaServico>");
        xml.append("<Discriminacao>").append(escapeXml(nfse.getDescricaoServico())).append("</Discriminacao>");
        xml.append("<CodigoMunicipio>").append(emissor.getCodigoMunicipio()).append("</CodigoMunicipio>");
        xml.append("</Servico>");
        xml.append("<Prestador>");
        xml.append("<CpfCnpj><Cnpj>").append(cpfCnpjEmissor).append("</Cnpj></CpfCnpj>");
        xml.append("<InscricaoMunicipal>").append(emissor.getInscricaoMunicipal()).append("</InscricaoMunicipal>");
        xml.append("</Prestador>");
        xml.append("<Tomador>");
        xml.append("<IdentificacaoTomador>");
        if (cpfCnpjTomador.length() == 11) {
            xml.append("<CpfCnpj><Cpf>").append(cpfCnpjTomador).append("</Cpf></CpfCnpj>");
        } else if (cpfCnpjTomador.length() == 14) {
            xml.append("<CpfCnpj><Cnpj>").append(cpfCnpjTomador).append("</Cnpj></CpfCnpj>");
        }
        xml.append("</IdentificacaoTomador>");
        xml.append("<RazaoSocial>").append(escapeXml(nfse.getTomadorNome())).append("</RazaoSocial>");
        if (temEnderecoTomador(nfse)) {
            xml.append("<Endereco>");
            xml.append("<Endereco>").append(escapeXml(nfse.getTomadorLogradouro())).append("</Endereco>");
            xml.append("<Numero>").append(escapeXml(nfse.getTomadorNumero())).append("</Numero>");
            xml.append("<Bairro>").append(escapeXml(nfse.getTomadorBairro())).append("</Bairro>");
            xml.append("<CodigoMunicipio>").append(emissor.getCodigoMunicipio()).append("</CodigoMunicipio>");
            xml.append("<Uf>").append(escapeXml(nfse.getTomadorUf())).append("</Uf>");
            xml.append("<Cep>").append(sanitizarNumeros(nfse.getTomadorCep())).append("</Cep>");
            xml.append("</Endereco>");
        }
        if (nfse.getTomadorEmail() != null && !nfse.getTomadorEmail().isBlank()) {
            xml.append("<Contato><Email>").append(escapeXml(nfse.getTomadorEmail())).append("</Email></Contato>");
        }
        xml.append("</Tomador>");
        xml.append("</InfRps>");
        xml.append("</Rps>");
        xml.append("</ListaRps>");
        xml.append("</LoteRps>");
        xml.append("</EnviarLoteRpsEnvio>");
        return xml.toString();
    }

    public String montarEnvelopeSoap(String xmlAssinado) {
        StringBuilder envelope = new StringBuilder();
        envelope.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        envelope.append("<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" ");
        envelope.append("xmlns:nfse=\"http://nfse.abrasf.org.br\">");
        envelope.append("<soapenv:Header/>");
        envelope.append("<soapenv:Body>");
        envelope.append("<nfse:RecepcionarLoteRpsEnvio>");
        envelope.append(xmlAssinado.replaceFirst("<\\?xml version=\"1.0\" encoding=\"UTF-8\"\\?>", ""));
        envelope.append("</nfse:RecepcionarLoteRpsEnvio>");
        envelope.append("</soapenv:Body>");
        envelope.append("</soapenv:Envelope>");
        return envelope.toString();
    }

    private boolean temEnderecoTomador(Nfse nfse) {
        return nfse.getTomadorLogradouro() != null && !nfse.getTomadorLogradouro().isBlank();
    }

    private String sanitizarNumeros(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.replaceAll("\\D", "");
    }

    private String escapeXml(String valor) {
        if (valor == null) {
            return "";
        }
        return valor
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
