package com.OdontoHelpBackend.infra.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SecurityFilter securityFilter;
    private final Environment environment;

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Se a lista estiver vazia no properties, garante que o localhost e vercel funcionem
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            config.setAllowedOrigins(List.of("http://localhost:5173", "https://odonto-help.vercel.app"));
        } else {
            config.setAllowedOrigins(allowedOrigins);
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean isTestProfile = Arrays.asList(environment.getActiveProfiles()).contains("test");

        http
                .csrf(AbstractHttpConfigurer::disable)
                // Ativa o CORS utilizando o bean definido acima
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {

                    if (isTestProfile) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }

                    auth
                            .requestMatchers("/auth/**").permitAll()
                            .requestMatchers("/usuarios/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.GET,   "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PUT,   "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PATCH, "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.GET,   "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PUT,   "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PATCH, "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers("/agendamentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers("/dashboard/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.GET,   "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PUT,   "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PATCH, "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers("/atendimentos/**").hasAnyRole("ADMIN", "DENTISTA")
                            .requestMatchers("/planos-tratamento/**").hasAnyRole("ADMIN", "DENTISTA")
                            .anyRequest().authenticated();
                })
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}