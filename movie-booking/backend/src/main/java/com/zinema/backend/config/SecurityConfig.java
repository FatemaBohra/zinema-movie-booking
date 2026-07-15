package com.zinema.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${auth0.audience}")
    private String audience;

    @Value("${auth0.domain}")
    private String domain;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/showtimes/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/movies/**").hasAuthority("ROLE_admin")
                        .requestMatchers(HttpMethod.PUT, "/api/movies/**").hasAuthority("ROLE_admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/movies/**").hasAuthority("ROLE_admin")
                        .requestMatchers(HttpMethod.POST, "/api/showtimes/**").hasAuthority("ROLE_admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/showtimes/**").hasAuthority("ROLE_admin")
                                .requestMatchers("/api/payments/**").permitAll()
                                .requestMatchers("/api/s3/**").hasAuthority("ROLE_admin")
//                        .requestMatchers("/api/payments/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder()))
                );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(
                "https://" + domain + "/");

        OAuth2TokenValidator<Jwt> audienceValidator = token -> {
            if (token.getAudience().contains(audience)) {
                return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.success();
            }
            return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
                    .failure(new org.springframework.security.oauth2.core.OAuth2Error("invalid_token"));
        };

        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(
                "https://" + domain + "/");

        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(
                withIssuer, audienceValidator);

        jwtDecoder.setJwtValidator(withAudience);
        return jwtDecoder;
    }
}