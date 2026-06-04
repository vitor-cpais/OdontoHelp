package com.OdontoHelpBackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI odontoHelpOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("OdontoHelp API")
                        .description("API do sistema odontológico OdontoHelp: usuários, pacientes, dentistas, "
                                + "agendamentos, atendimentos, odontograma e planos de tratamento.")
                        .version("v1")
                        .contact(new Contact().name("OdontoHelp"))
                        .license(new License().name("Uso interno")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME,
                        new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Informe o token JWT obtido em /auth/login.")));
    }
}
