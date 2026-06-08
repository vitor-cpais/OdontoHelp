package br.com.odontohelp.fiscal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "fiscal.emissor")
public class EmissorProperties {

    private String cnpj = "";
    private String razaoSocial = "";
    private String inscricaoMunicipal = "";
    private String codigoMunicipio = "";
    private String codigoServicoLc116 = "";
    private String aliquotaIss = "0";
    private String regimeTributario = "1";
    private String logradouro = "";
    private String numero = "";
    private String bairro = "";
    private String cep = "";
}
