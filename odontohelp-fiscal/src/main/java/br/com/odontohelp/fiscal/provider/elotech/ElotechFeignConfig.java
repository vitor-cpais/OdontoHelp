package br.com.odontohelp.fiscal.provider.elotech;

import feign.codec.Decoder;
import feign.codec.Encoder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

@Configuration
@ConditionalOnProperty(name = "fiscal.emissao.modo", havingValue = "AUTOMATICO")
public class ElotechFeignConfig {

    // Feign foi projetado para REST/JSON. Este encoder customizado e necessario
    // para enviar XML/SOAP sem que o Feign serialize o body.
    @Bean
    public Encoder feignEncoder() {
        return (object, bodyType, template) -> {
            if (object instanceof String xml) {
                template.body(xml.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
            } else {
                throw new IllegalArgumentException("Corpo deve ser String XML");
            }
        };
    }

    @Bean
    public Decoder feignDecoder() {
        return (response, type) -> {
            if (response.body() == null) {
                return "";
            }
            return new String(response.body().asInputStream().readAllBytes(), StandardCharsets.UTF_8);
        };
    }
}
