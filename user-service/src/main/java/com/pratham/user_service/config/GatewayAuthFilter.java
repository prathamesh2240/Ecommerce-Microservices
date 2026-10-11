package com.pratham.user_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * GatewayAuthFilter — Trust-Boundary Authentication Filter
 *
 * <p>In a microservices architecture, the API Gateway is the single entry point
 * responsible for JWT validation. Once the Gateway validates the JWT, it extracts
 * the user context and propagates it to downstream services via trusted internal headers:
 * <ul>
 *   <li>{@code X-User-Id}    — The authenticated user's database ID</li>
 *   <li>{@code X-User-Role}  — The user's granted role (e.g. ROLE_USER, ROLE_ADMIN)</li>
 *   <li>{@code X-User-Email} — The user's email address (JWT subject)</li>
 * </ul>
 *
 * <p>This filter reads those headers and populates the Spring Security {@link SecurityContextHolder},
 * enabling downstream Spring Security rules and {@code @PreAuthorize} checks to function correctly.
 *
 * <p><strong>Security Note:</strong> This filter trusts the gateway-injected headers. In production,
 * direct network access to this service should be blocked so only the API Gateway can call it.
 */
@Component
@Slf4j
public class GatewayAuthFilter extends OncePerRequestFilter {

    public static final String HEADER_USER_ID    = "X-User-Id";
    public static final String HEADER_USER_ROLE  = "X-User-Role";
    public static final String HEADER_USER_EMAIL = "X-User-Email";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String userId    = request.getHeader(HEADER_USER_ID);
        String userRole  = request.getHeader(HEADER_USER_ROLE);
        String userEmail = request.getHeader(HEADER_USER_EMAIL);

        if (StringUtils.hasText(userId) && StringUtils.hasText(userRole) && StringUtils.hasText(userEmail)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            log.debug("GatewayAuthFilter: authenticating request for userId={}, role={}, email={}",
                    userId, userRole, userEmail);

            var authority = new SimpleGrantedAuthority(userRole);
            var authentication = new UsernamePasswordAuthenticationToken(
                    userEmail,   // principal — the email/username
                    null,        // credentials — already verified by gateway
                    List.of(authority)
            );
            // Store userId as details for controllers to retrieve
            authentication.setDetails(userId);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
