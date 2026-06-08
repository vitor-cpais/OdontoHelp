package br.com.odontohelp.fiscal.util;

import br.com.odontohelp.fiscal.exception.AssinaturaDigitalException;
import lombok.extern.slf4j.Slf4j;
import org.apache.xml.security.Init;
import org.apache.xml.security.signature.XMLSignature;
import org.apache.xml.security.transforms.Transforms;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;

@Service
@Slf4j
public class AssinaturaDigitalService {

    private static volatile boolean xmlSecInicializado;

    @Value("${fiscal.certificado.caminho:}")
    private String certificadoCaminho;

    @Value("${fiscal.certificado.senha:}")
    private String certificadoSenha;

    private volatile KeyStore keyStore;
    private volatile PrivateKey privateKey;
    private volatile X509Certificate certificate;

    protected AssinaturaDigitalService() {
        inicializarXmlSec();
    }

    public String assinar(String xml) {
        try {
            Document document = XmlUtil.parseSeguro(xml);
            Element loteRps = (Element) document.getElementsByTagName("LoteRps").item(0);
            if (loteRps == null) {
                throw new AssinaturaDigitalException("Elemento LoteRps nao encontrado para assinatura");
            }

            carregarCertificadoSeNecessario();

            // ABRASF 2.03 exige RSA_SHA1. JDK 22 bloqueia este algoritmo por padrao.
            // A propriedade -Djdk.security.legacyAlgorithms=SHA1withRSA deve estar em JAVA_OPTS no container.
            XMLSignature signature = new XMLSignature(document, "", XMLSignature.ALGO_ID_SIGNATURE_RSA_SHA1);
            loteRps.appendChild(signature.getElement());
            signature.addDocument(
                    "#lote1",
                    new Transforms(document),
                    Transforms.TRANSFORM_C14N_EXCL_OMIT_COMMENTS
            );
            signature.addKeyInfo(certificate);
            signature.sign(privateKey);

            return documentToString(document);
        } catch (AssinaturaDigitalException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AssinaturaDigitalException("Falha ao assinar XML", ex);
        }
    }

    private synchronized void carregarCertificadoSeNecessario() {
        if (privateKey != null && certificate != null) {
            return;
        }
        if (certificadoCaminho == null || certificadoCaminho.isBlank()) {
            throw new AssinaturaDigitalException("Certificado A1 nao configurado (fiscal.certificado.caminho)");
        }
        Path path = Path.of(certificadoCaminho);
        if (!Files.exists(path)) {
            throw new AssinaturaDigitalException("Arquivo de certificado nao encontrado: " + certificadoCaminho);
        }
        try (InputStream inputStream = Files.newInputStream(path)) {
            KeyStore store = KeyStore.getInstance("PKCS12");
            char[] senha = certificadoSenha == null ? new char[0] : certificadoSenha.toCharArray();
            store.load(inputStream, senha);
            String alias = store.aliases().nextElement();
            this.keyStore = store;
            this.privateKey = (PrivateKey) store.getKey(alias, senha);
            this.certificate = (X509Certificate) store.getCertificate(alias);
            log.info("Certificado A1 carregado para assinatura digital");
        } catch (Exception ex) {
            throw new AssinaturaDigitalException("Falha ao carregar certificado A1", ex);
        }
    }

    private static void inicializarXmlSec() {
        if (!xmlSecInicializado) {
            synchronized (AssinaturaDigitalService.class) {
                if (!xmlSecInicializado) {
                    Init.init();
                    xmlSecInicializado = true;
                }
            }
        }
    }

    private String documentToString(Document document) throws Exception {
        var transformerFactory = javax.xml.transform.TransformerFactory.newInstance();
        transformerFactory.setFeature(javax.xml.XMLConstants.FEATURE_SECURE_PROCESSING, true);
        var transformer = transformerFactory.newTransformer();
        var writer = new java.io.StringWriter();
        transformer.transform(new javax.xml.transform.dom.DOMSource(document), new javax.xml.transform.stream.StreamResult(writer));
        return writer.toString();
    }
}
