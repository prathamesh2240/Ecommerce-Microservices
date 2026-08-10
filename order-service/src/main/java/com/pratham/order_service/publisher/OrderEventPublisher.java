package com.pratham.order_service.publisher;

import com.pratham.order_service.dto.event.EventEnvelope;
import com.pratham.order_service.dto.event.OrderEventItem;
import com.pratham.order_service.dto.event.OrderEventPayload;
import com.pratham.order_service.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final KafkaTemplate<String, EventEnvelope<OrderEventPayload>> kafkaTemplate;

    private static final String TOPIC = "ecommerce.order.events.v1";

    public void publishOrderCreatedEvent(Order order) {
        publishEvent("ORDER_CREATED", order);
    }

    public void publishOrderCancelledEvent(Order order) {
        publishEvent("ORDER_CANCELLED", order);
    }

    private void publishEvent(String eventType, Order order) {
        log.info("Preparing to publish event: {} for Order Number: {}", eventType, order.getOrderNumber());

        List<OrderEventItem> eventItems = order.getOrderItems().stream()
                .map(item -> OrderEventItem.builder()
                        .sku(item.getSku())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        OrderEventPayload payload = OrderEventPayload.builder()
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomerId())
                .totalAmount(order.getTotalAmount())
                .items(eventItems)
                .build();

        EventEnvelope<OrderEventPayload> envelope = EventEnvelope.<OrderEventPayload>builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .eventVersion("v1")
                .occurredAt(LocalDateTime.now())
                .source("order-service")
                .correlationId(order.getOrderNumber())
                .payload(payload)
                .build();

        // Use orderNumber as key to preserve ordering for each order's lifecycle
        String key = order.getOrderNumber();

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
