package com.OdontoHelpBackend.infra.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

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
        http
                .csrf(AbstractHttpConfigurer::disable)
                .anonymous(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Não autenticado\"}"
                            );
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Você não tem permissão para esta ação\"}"
                            );
                        })
                )
                .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/auth/**").permitAll()
                            .requestMatchers(
                                    "/swagger-ui.html",
                                    "/swagger-ui/**",
                                    "/v3/api-docs",
                                    "/v3/api-docs/**",
                                    "/swagger-resources/**",
                                    "/webjars/**"
                            ).permitAll()
                            .requestMatchers("/usuarios", "/usuarios/**").hasRole("ADMIN")

                            // Dentistas
                            .requestMatchers(HttpMethod.GET,   "/dentistas", "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/dentistas", "/dentistas/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.PUT,   "/dentistas", "/dentistas/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.PATCH, "/dentistas", "/dentistas/**").hasRole("ADMIN")

                            // Odontograma clínico
                            .requestMatchers(HttpMethod.GET, "/pacientes/*/odontograma/**").hasAnyRole("ADMIN", "DENTISTA")
                            .requestMatchers(HttpMethod.PATCH, "/pacientes/*/odontograma/**").hasAnyRole("ADMIN", "DENTISTA")

                            // Itens pendentes do plano — DENTISTA precisa ver como referência
                            .requestMatchers(HttpMethod.GET, "/pacientes/*/planos/itens-pendentes").hasAnyRole("ADMIN", "DENTISTA")

                            // Pacientes — regra genérica (PATCH de odontograma já foi tratado acima)
                            .requestMatchers(HttpMethod.GET,   "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.PUT,   "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.PATCH, "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")

                            // Agendamentos e Dashboard
                            .requestMatchers("/agendamentos", "/agendamentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers("/dashboard", "/dashboard/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")

                            // Procedimentos
                            .requestMatchers(HttpMethod.GET,   "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PUT,   "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PATCH, "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")

                            // Atendimentos e Planos de Tratamento
                            .requestMatchers("/atendimentos", "/atendimentos/**").hasAnyRole("ADMIN", "DENTISTA")
                            .requestMatchers("/planos-tratamento", "/planos-tratamento/**").hasAnyRole("ADMIN", "DENTISTA")

                            .anyRequest().authenticated()
                )
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
