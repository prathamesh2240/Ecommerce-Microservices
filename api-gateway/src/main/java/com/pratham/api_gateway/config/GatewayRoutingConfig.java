package com.pratham.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
public class GatewayRoutingConfig {

    @Bean
    public RouterFunction<ServerResponse> identityRoute() {
        return route("identity-route")
                .route(path("/api/identity/**"), http())
                .filter(lb("USER-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> catalogRoute() {
        return route("catalog-route")
                .route(path("/api/catalog/**"), http())
                .filter(lb("PRODUCT-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> orderRoute() {
        return route("order-route")
                .route(path("/api/orders/**"), http())
                .filter(lb("ORDER-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> inventoryRoute() {
        return route("inventory-route")
                .route(path("/api/inventory/**"), http())
                .filter(lb("INVENTORY-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> paymentRoute() {
        return route("payment-route")
                .route(path("/api/payments/**"), http())
                .filter(lb("PAYMENT-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> notificationRoute() {
        return route("notification-route")
                .route(path("/api/notifications/**"), http())
                .filter(lb("NOTIFICATION-SERVICE"))
                .build();
    }
}
