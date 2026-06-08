package com.OdontoHelpBackend.infra.security;

import com.OdontoHelpBackend.infra.security.idempotency.IdempotencyFilter;
import com.OdontoHelpBackend.infra.security.ratelimit.RateLimitFilter;
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
    private final InternalServiceAccessFilter internalServiceAccessFilter;
    private final RateLimitFilter rateLimitFilter;
    private final IdempotencyFilter idempotencyFilter;

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${springdoc.swagger-ui.enabled:true}")
    private boolean swaggerEnabled;

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
                        .authenticationEntryPoint((request, response, authException) ->
                                UnauthorizedResponseWriter.write(response, "Não autenticado"))
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Você não tem permissão para esta ação\"}"
                            );
                        })
                )
                .authorizeHttpRequests(auth -> {
                            auth.requestMatchers(HttpMethod.POST, "/auth/onboarding/concluir").authenticated()
                            .requestMatchers("/auth/**").permitAll()
                            .requestMatchers("/internal/**").permitAll();
                            if (swaggerEnabled) {
                                auth.requestMatchers(
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/v3/api-docs",
                                        "/v3/api-docs/**",
                                        "/swagger-resources/**",
                                        "/webjars/**"
                                ).permitAll();
                            }
                            auth.requestMatchers("/usuarios", "/usuarios/**").hasRole("ADMIN")

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

                            // LGPD — rotas específicas antes da regra genérica de pacientes
                            .requestMatchers(HttpMethod.GET, "/pacientes/*/dados-pessoais").hasAnyRole("ADMIN", "PACIENTE")
                            .requestMatchers(HttpMethod.DELETE, "/pacientes/*/anonimizar").hasRole("ADMIN")

                            // Pacientes — regra genérica (PATCH de odontograma já foi tratado acima)
                            .requestMatchers(HttpMethod.GET, "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.PUT,   "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.PATCH, "/pacientes", "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.DELETE, "/pacientes/*/arquivos/*").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")

                            // Agendamentos e Dashboard
                            .requestMatchers("/agendamentos", "/agendamentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers("/dashboard", "/dashboard/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")

                            // Procedimentos
                            .requestMatchers(HttpMethod.GET,   "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                            .requestMatchers(HttpMethod.POST,  "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PUT,   "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PATCH, "/procedimentos", "/procedimentos/**").hasAnyRole("ADMIN", "RECEPCAO")

                            // Atendimentos e Planos de Tratamento
                            .requestMatchers(HttpMethod.GET, "/atendimentos/pendentes-cobranca")
                                .hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.PATCH, "/atendimentos/itens/*/marcar-cobrado")
                                .hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers("/notificacoes/cobranca/**").hasAnyRole("ADMIN", "RECEPCAO")
                            .requestMatchers(HttpMethod.POST, "/atendimentos/*/arquivos").hasAnyRole("ADMIN", "DENTISTA")
                            .requestMatchers("/atendimentos", "/atendimentos/**").hasAnyRole("ADMIN", "DENTISTA")
                            .requestMatchers("/planos-tratamento", "/planos-tratamento/**").hasAnyRole("ADMIN", "DENTISTA")

                            .anyRequest().authenticated();
                });
        SecurityHeadersConfig.apply(http);
        http
                .addFilterBefore(internalServiceAccessFilter, UsernamePasswordAuthenticationFilter.class)
                // Todos ancorados em UsernamePasswordAuthenticationFilter (Spring Security 6.4+ exige ordem registrada)
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(idempotencyFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class);

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
