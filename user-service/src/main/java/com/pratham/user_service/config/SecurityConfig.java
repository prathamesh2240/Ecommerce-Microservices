package com.pratham.user_service.config;

import com.pratham.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayAuthFilter gatewayAuthFilter;

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // ── Public Endpoints ───────────────────────────────────────────────
                        // Registration: POST /api/identity/users (no auth needed)
                        .requestMatchers(HttpMethod.POST, "/api/identity/users").permitAll()
                        // Login endpoint
                        .requestMatchers("/api/identity/auth/login").permitAll()
                        // Actuator & API docs
                        .requestMatchers("/actuator/**", "/v3/api-docs/**",
                                "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // ── Admin-Only Endpoints ───────────────────────────────────────────
                        // List all users — ADMIN only
                        .requestMatchers(HttpMethod.GET, "/api/identity/users").hasAuthority("ROLE_ADMIN")
                        // Delete any user — ADMIN only
                        .requestMatchers(HttpMethod.DELETE, "/api/identity/users/**").hasAuthority("ROLE_ADMIN")

                        // ── Authenticated Endpoints ────────────────────────────────────────
                        // All other requests require a valid authenticated session
                        // (set by GatewayAuthFilter from gateway-forwarded headers)
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Register GatewayAuthFilter BEFORE Spring's default auth filter
                // This populates SecurityContext from gateway headers for every request
                .addFilterBefore(gatewayAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
