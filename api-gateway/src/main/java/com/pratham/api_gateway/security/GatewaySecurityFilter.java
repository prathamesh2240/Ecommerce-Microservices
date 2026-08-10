package com.pratham.api_gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@Component
public class GatewaySecurityFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(GatewaySecurityFilter.class);

    private final JwtValidator jwtValidator;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> PUBLIC_ROUTES = List.of(
            "/api/identity/auth/login",
            "/api/identity/users",
            "/actuator/health",
            "/actuator/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    );

    public GatewaySecurityFilter(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        log.debug("API Gateway intercepting request: {} {}", method, uri);

        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (isPublicRoute(uri, method)) {
            log.debug("Permitting public route: {} {}", method, uri);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Blocking request: {} {} - Missing/invalid Authorization header", method, uri);
            writeErrorResponse(request, response, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = jwtValidator.getClaims(token);

            if (claims.getExpiration().before(new Date())) {
                log.warn("Blocking request: {} {} - Token expired", method, uri);
                writeErrorResponse(request, response, HttpStatus.UNAUTHORIZED, "Token has expired");
                return;
            }

            String role = claims.get("role", String.class);
            String email = claims.getSubject();
            Long userId = null;
            Object userIdObj = claims.get("userId");
            if (userIdObj instanceof Number) {
                userId = ((Number) userIdObj).longValue();
            }

            // Role-Based Route Authorization checks
            if (pathMatcher.match("/api/catalog/products/**", uri) && 
                    (method.equalsIgnoreCase("POST") || method.equalsIgnoreCase("PUT") || method.equalsIgnoreCase("DELETE"))) {
                if (!"ROLE_ADMIN".equals(role)) {
                    log.warn("Blocking request: {} {} - User role {} lacks ADMIN privileges", method, uri, role);
                    writeErrorResponse(request, response, HttpStatus.FORBIDDEN, "Access denied: Administrative privileges required");
                    return;
                }
            }

            if (pathMatcher.match("/api/orders/**", uri) || pathMatcher.match("/api/payments/**", uri)) {
                if (!"ROLE_USER".equals(role) && !"ROLE_CUSTOMER".equals(role) && !"ROLE_ADMIN".equals(role)) {
                    log.warn("Blocking request: {} {} - User role {} lacks customer clearance", method, uri, role);
                    writeErrorResponse(request, response, HttpStatus.FORBIDDEN, "Access denied: Customer authentication required");
                    return;
                }
            }

            log.debug("Propagating valid request: {} {} with claims - userId: {}, role: {}", method, uri, userId, role);

            // Propagate extracted context via wrapped headers
            HeaderRequestWrapper wrappedRequest = new HeaderRequestWrapper(request);
            wrappedRequest.addHeader("X-User-Id", String.valueOf(userId));
            wrappedRequest.addHeader("X-User-Role", role);
            wrappedRequest.addHeader("X-User-Email", email);

            filterChain.doFilter(wrappedRequest, response);

        } catch (ExpiredJwtException ex) {
            log.warn("Blocking request: {} {} - Token expired exception", method, uri);
            writeErrorResponse(request, response, HttpStatus.UNAUTHORIZED, "Token has expired");
        } catch (SignatureException ex) {
            log.warn("Blocking request: {} {} - Cryptographic signature mismatch", method, uri);
            writeErrorResponse(request, response, HttpStatus.UNAUTHORIZED, "Invalid cryptographic signature");
        } catch (Exception ex) {
            log.error("Blocking request: {} {} - Parsing failure: {}", method, uri, ex.getMessage(), ex);
            writeErrorResponse(request, response, HttpStatus.UNAUTHORIZED, "Malformed or invalid token");
        }
    }

    private boolean isPublicRoute(String uri, String method) {
        // GET calls to catalog and inventory are public
        if (method.equalsIgnoreCase("GET") && (pathMatcher.match("/api/catalog/**", uri) || pathMatcher.match("/api/inventory/**", uri))) {
            return true;
        }

        // Check if URI matches other static permit-all rules
        return PUBLIC_ROUTES.stream().anyMatch(pattern -> pathMatcher.match(pattern, uri));
    }

    private void writeErrorResponse(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");

        String json = String.format(
                "{\"success\":false,\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                java.time.LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );

        response.getWriter().write(json);
    }
}
