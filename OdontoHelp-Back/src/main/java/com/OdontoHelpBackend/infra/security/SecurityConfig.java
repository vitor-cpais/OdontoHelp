package com.OdontoHelpBackend.infra.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
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

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:4200",
                "http://localhost:5173",
                "https://odonto-help.vercel.app"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }



    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // público
                        .requestMatchers("/auth/**").permitAll()

                        // só ADMIN
                        .requestMatchers("/usuarios/**").hasRole("ADMIN")

                        // ADMIN + RECEPCAO
                        .requestMatchers(HttpMethod.POST, "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO")
                        .requestMatchers(HttpMethod.PUT,  "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO")
                        .requestMatchers(HttpMethod.PATCH,"/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO")
                        .requestMatchers(HttpMethod.GET,  "/dentistas/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")

                        // ADMIN + RECEPCAO + DENTISTA (leitura)
                        .requestMatchers(HttpMethod.GET,  "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")
                        .requestMatchers(HttpMethod.POST, "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO")
                        .requestMatchers(HttpMethod.PUT,  "/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO")
                        .requestMatchers(HttpMethod.PATCH,"/pacientes/**").hasAnyRole("ADMIN", "RECEPCAO")

                        // agendamentos — todos autenticados (filtro por dono no service)
                        .requestMatchers("/agendamentos/**").hasAnyRole("ADMIN", "RECEPCAO", "DENTISTA")

                        // dashboard — ADMIN + RECEPCAO
                        .requestMatchers("/dashboard/**").hasAnyRole("ADMIN", "RECEPCAO")

                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
