package br.com.odontohelp.fiscal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI fiscalOpenApi() {
        final String bearer = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Gateway Fiscal NFS-e — OdontoHelp Platform")
                        .version("1.0.0")
                        .description("""
                                Microservico de emissao de NFS-e. Reutilizavel em multiplas aplicacoes via tenantId. \
                                Suporta emissao manual (portal OXY) e automatica (SOAP + certificado A1) \
                                configuravel via variavel de ambiente."""))
                .addSecurityItem(new SecurityRequirement().addList(bearer))
                .schemaRequirement(bearer, new SecurityScheme()
                        .name(bearer)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }
}
