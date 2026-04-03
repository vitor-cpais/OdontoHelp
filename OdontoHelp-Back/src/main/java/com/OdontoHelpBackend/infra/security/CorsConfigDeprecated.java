package com.OdontoHelpBackend.infra.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfigDeprecated implements WebMvcConfigurer {/*

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:4200",
                        "http://localhost:5173",
                        "https://odonto-help.vercel.app" // Sem a barra "/" no final!
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }*/
}