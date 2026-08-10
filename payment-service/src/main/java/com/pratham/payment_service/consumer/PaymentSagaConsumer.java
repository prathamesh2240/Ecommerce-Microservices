package com.pratham.payment_service.consumer;

import com.pratham.payment_service.dto.event.EventEnvelope;
import com.pratham.payment_service.dto.event.InventoryEventPayload;
import com.pratham.payment_service.dto.event.OrderEventPayload;
import com.pratham.payment_service.entity.Payment;
import com.pratham.payment_service.publisher.PaymentEventPublisher;
import com.pratham.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSagaConsumer {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher eventPublisher;
    private final com.pratham.payment_service.client.ExternalPaymentGatewayClient paymentGatewayClient;

    @KafkaListener(
            topics = "ecommerce.order.events.v1",
            groupId = "payment-group"
    )
    @Transactional
    public void consumeOrderEvent(@Payload EventEnvelope<OrderEventPayload> eventEnvelope) {
        log.info("Received Order Event: {} inside Payment Service for Correlation ID: {}", 
                eventEnvelope.getEventType(), eventEnvelope.getCorrelationId());
        
        OrderEventPayload payload = eventEnvelope.getPayload();
        if (payload == null) {
            log.error("Order event payload is null. Skipping.");
            return;
        }

        if ("ORDER_CREATED".equals(eventEnvelope.getEventType())) {
            // Guard against duplicate: check if payment record for this order already exists
            if (paymentRepository.findByOrderNumber(payload.getOrderNumber()).isPresent()) {
                log.warn("Payment record already initialized for Order: {}. Skipping.", payload.getOrderNumber());
                return;
            }

            // Create initial PENDING payment record
            String paymentId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Payment payment = Payment.builder()
                    .paymentId(paymentId)
                    .orderNumber(payload.getOrderNumber())
                    .amount(payload.getTotalAmount())
                    .status("PENDING")
                    .processedAt(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);
            log.info("Initialized PENDING payment transaction: {} for Order: {}", paymentId, payload.getOrderNumber());
        }
    }

    @KafkaListener(
            topics = "ecommerce.inventory.events.v1",
            groupId = "payment-group"
    )
    @Transactional
    public void consumeInventoryEvent(@Payload EventEnvelope<InventoryEventPayload> eventEnvelope) {
        log.info("Received Inventory Event: {} inside Payment Service for Correlation ID: {}", 
                eventEnvelope.getEventType(), eventEnvelope.getCorrelationId());
        
        InventoryEventPayload payload = eventEnvelope.getPayload();
        if (payload == null) {
            log.error("Inventory event payload is null. Skipping.");
            return;
        }

        if ("STOCK_RESERVED".equals(eventEnvelope.getEventType())) {
            String orderNumber = payload.getOrderId(); // maps to orderId/orderNumber
            
            Payment payment = paymentRepository.findByOrderNumber(orderNumber).orElse(null);
            if (payment == null) {
                log.warn("No pending payment transaction found for Order: {}. Skipping process.", orderNumber);
                return;
            }

            if (!"PENDING".equals(payment.getStatus())) {
                log.warn("Payment transaction: {} for Order: {} is already in status: {}. Skipping process.", 
                        payment.getPaymentId(), orderNumber, payment.getStatus());
                return;
            }

            log.info("Processing stock-reserved payment charging for transaction: {}, Order: {}", 
                    payment.getPaymentId(), orderNumber);

            // Delegate to the resilient payment gateway client with integrated Circuit Breaker and Retry
            boolean isSuccessful = paymentGatewayClient.processPayment(
                    orderNumber, payment.getAmount(), payload.getSku());

            if (isSuccessful) {
                payment.setStatus("SUCCESS");
                log.info("Resilient charge succeeded for Order: {}. Txn ID: {}", orderNumber, payment.getPaymentId());
            } else {
                payment.setStatus("FAILED");
                payment.setFailureReason("Payment declined or gateway service unavailable");
                log.warn("Resilient charge failed for Order: {}. Txn ID: {}", orderNumber, payment.getPaymentId());
            }

            payment.setProcessedAt(LocalDateTime.now());
            Payment savedPayment = paymentRepository.save(payment);

            // Publish PAYMENT_COMPLETED or PAYMENT_FAILED event to notify order-service
            eventPublisher.publishPaymentEvent(savedPayment);
        }
    }
}
