package com.pratham.inventory_service.publisher;

import com.pratham.inventory_service.dto.event.EventEnvelope;
import com.pratham.inventory_service.dto.event.InventoryEventPayload;
import com.pratham.inventory_service.dto.response.ReservationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventPublisher {

    private final KafkaTemplate<String, EventEnvelope<InventoryEventPayload>> kafkaTemplate;
    
    private static final String TOPIC = "ecommerce.inventory.events.v1";

    public void publishStockReservedEvent(ReservationResponse reservation) {
        log.info("Preparing to publish STOCK_RESERVED event for SKU: {}, Code: {}", 
                reservation.getSku(), reservation.getReservationCode());

        // Construct the domain-specific event payload
        InventoryEventPayload payload = InventoryEventPayload.builder()
                .reservationCode(reservation.getReservationCode())
                .orderId(reservation.getOrderId())
                .sku(reservation.getSku())
                .warehouseId(reservation.getWarehouseId())
                .quantity(reservation.getQuantity())
                .expiresAt(reservation.getExpiresAt())
                .build();

        // Wrap the payload inside the standard enterprise metadata envelope
        EventEnvelope<InventoryEventPayload> envelope = EventEnvelope.<InventoryEventPayload>builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("STOCK_RESERVED")
                .eventVersion("v1")
                .occurredAt(LocalDateTime.now())
                .source("inventory-service")
                .correlationId(reservation.getOrderId()) // Link order lifecycle events together
                .payload(payload)
                .build();

        // Use SKU as the Kafka message key to guarantee ordering of all events related to this SKU
        String key = reservation.getSku();

        // Publish to Kafka asynchronously
        kafkaTemplate.send(TOPIC, key, envelope)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Successfully sent STOCK_RESERVED event to topic: {} partition: {} offset: {}",
                                TOPIC,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send STOCK_RESERVED event to Kafka. Error: {}", ex.getMessage(), ex);
                    }
                });
    }

    public void publishStockReservationFailedEvent(String orderId, String reason) {
        log.info("Preparing to publish STOCK_RESERVATION_FAILED event for Order: {}, Reason: {}", orderId, reason);

        InventoryEventPayload payload = InventoryEventPayload.builder()
                .orderId(orderId)
                .build();

        EventEnvelope<InventoryEventPayload> envelope = EventEnvelope.<InventoryEventPayload>builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("STOCK_RESERVATION_FAILED")
                .eventVersion("v1")
                .occurredAt(LocalDateTime.now())
                .source("inventory-service")
                .correlationId(orderId)
                .payload(payload)
                .build();

        String key = orderId;

        kafkaTemplate.send(TOPIC, key, envelope)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Successfully sent STOCK_RESERVATION_FAILED event to topic: {} partition: {} offset: {}",
                                TOPIC, result.getRecordMetadata().partition(), result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send STOCK_RESERVATION_FAILED event. Error: {}", ex.getMessage(), ex);
                    }
                });
    }
}
