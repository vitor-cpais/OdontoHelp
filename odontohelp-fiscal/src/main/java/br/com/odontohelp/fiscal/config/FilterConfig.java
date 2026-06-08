package br.com.odontohelp.fiscal.config;

import br.com.odontohelp.fiscal.infra.ratelimit.RateLimitFilter;
import br.com.odontohelp.fiscal.infra.ratelimit.RateLimitService;
import br.com.odontohelp.fiscal.tenant.TenantFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public RateLimitFilter rateLimitFilter(RateLimitService rateLimitService, JwtService jwtService) {
        return new RateLimitFilter(rateLimitService, jwtService);
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(RateLimitFilter rateLimitFilter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(rateLimitFilter);
        registration.addUrlPatterns("/v1/*");
        registration.setOrder(0);
        return registration;
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtService jwtService,
                                         JwtBlacklistService jwtBlacklistService,
                                         ObjectMapper objectMapper) {
        return new JwtAuthFilter(jwtService, jwtBlacklistService, objectMapper);
    }

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter jwtAuthFilter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(jwtAuthFilter);
        registration.addUrlPatterns("/v1/*");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    public TenantFilter tenantFilter() {
        return new TenantFilter();
    }

    @Bean
    public FilterRegistrationBean<TenantFilter> tenantFilterRegistration(TenantFilter tenantFilter) {
        FilterRegistrationBean<TenantFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(tenantFilter);
        registration.addUrlPatterns("/v1/*");
        registration.setOrder(2);
        return registration;
    }
}
