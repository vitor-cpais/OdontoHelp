package br.com.odontohelp.fiscal.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "fiscal.emissao.modo", havingValue = "AUTOMATICO")
@EnableFeignClients(basePackages = "br.com.odontohelp.fiscal.provider.elotech")
public class ElotechAutoConfiguration {
}
