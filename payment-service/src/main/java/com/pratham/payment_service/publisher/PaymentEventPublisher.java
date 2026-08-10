package com.pratham.payment_service.publisher;

import com.pratham.payment_service.dto.event.EventEnvelope;
import com.pratham.payment_service.dto.event.PaymentEventPayload;
import com.pratham.payment_service.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final KafkaTemplate<String, EventEnvelope<PaymentEventPayload>> kafkaTemplate;

    private static final String TOPIC = "ecommerce.payment.events.v1";

    public void publishPaymentEvent(Payment payment) {
        String eventType = "SUCCESS".equals(payment.getStatus()) ? "PAYMENT_COMPLETED" : "PAYMENT_FAILED";
        log.info("Preparing to publish event: {} for Order Number: {}", eventType, payment.getOrderNumber());

        PaymentEventPayload payload = PaymentEventPayload.builder()
                .paymentId(payment.getPaymentId())
                .orderNumber(payment.getOrderNumber())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .failureReason(payment.getFailureReason())
                .build();

        EventEnvelope<PaymentEventPayload> envelope = EventEnvelope.<PaymentEventPayload>builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .eventVersion("v1")
                .occurredAt(LocalDateTime.now())
                .source("payment-service")
                .correlationId(payment.getOrderNumber())
                .payload(payload)
                .build();

        // Use orderNumber as key to preserve downstream ordering
        String key = payment.getOrderNumber();

        kafkaTemplate.send(TOPIC, key, envelope)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Successfully sent {} event to topic: {} partition: {} offset: {}",
                                eventType, TOPIC, result.getRecordMetadata().partition(), result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send {} event to Kafka. Error: {}", eventType, ex.getMessage(), ex);
                    }
                });
    }
}
