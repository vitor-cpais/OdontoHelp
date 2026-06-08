package br.com.odontohelp.fiscal.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(EmissorProperties.class)
public class FiscalConfig {
}
