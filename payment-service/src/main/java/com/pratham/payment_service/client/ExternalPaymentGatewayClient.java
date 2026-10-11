package com.pratham.payment_service.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
public class ExternalPaymentGatewayClient {

    private int attempt = 0;

    @CircuitBreaker(name = "externalPaymentGatewayCB", fallbackMethod = "processPaymentFallback")
    @Retry(name = "externalPaymentGatewayRetry", fallbackMethod = "processPaymentFallback")
    public boolean processPayment(String orderNumber, BigDecimal amount, String sku) {
        log.info("Invoking external payment gateway (Stripe) for Order: {}, Amount: {}, Attempt: {}",
                orderNumber, amount, ++attempt);

        // Simulation A: Simulated downstream failure for payment Gateway (e.g. gateway
        // service outage)
        if (sku != null && sku.endsWith("-GATEWAYFAIL")) {
            log.error("Stripe gateway is experiencing 503 Service Unavailable");
            throw new RuntimeException("External payment gateway service is temporarily unavailable");
        }

        // Simulation B: Card declined (this is a business logic failure, should not
        // trigger retries or open circuit breaker!)
        if (sku != null && sku.endsWith("-PAYFAIL")) {
            log.warn("Stripe returned response: CARD_DECLINED (insufficient funds)");
            return false;
        }

        // Reset attempt counter on success
        attempt = 0;
        log.info("Stripe gateway successfully processed transaction for Order: {}", orderNumber);
        return true;
    }

    public boolean processPaymentFallback(String orderNumber, BigDecimal amount, String sku, Throwable t) {
        log.warn("Resilience4j Fallback triggered for Order: {}. Exception Type: {}, Message: {}",
                orderNumber, t.getClass().getSimpleName(), t.getMessage());
        return false;
    }
}
