package com.pratham.inventory_service.consumer;

import com.pratham.inventory_service.dto.event.EventEnvelope;
import com.pratham.inventory_service.dto.event.OrderEventPayload;
import com.pratham.inventory_service.dto.request.OrderReservationItem;
import com.pratham.inventory_service.publisher.InventoryEventPublisher;
import com.pratham.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventorySagaConsumer {

    private final InventoryService inventoryService;
    private final InventoryEventPublisher eventPublisher;

    @KafkaListener(
            topics = "ecommerce.order.events.v1",
            groupId = "inventory-group"
    )
    public void consumeOrderEvent(@Payload EventEnvelope<OrderEventPayload> eventEnvelope) {
        log.info("Received Order Event: {} for Correlation ID: {}", eventEnvelope.getEventType(), eventEnvelope.getCorrelationId());
        OrderEventPayload payload = eventEnvelope.getPayload();

        if (payload == null) {
            log.error("Order event payload is null. Skipping processing.");
            return;
        }

        if ("ORDER_CREATED".equals(eventEnvelope.getEventType())) {
            log.info("Processing STOCK RESERVATION for Order: {}", payload.getOrderNumber());
            
            List<OrderReservationItem> reservationItems = payload.getItems().stream()
                    .map(item -> OrderReservationItem.builder()
                            .sku(item.getSku())
                            .quantity(item.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            try {
                // Perform transactional stock hold allocation
                inventoryService.reserveStockForOrder(payload.getOrderNumber(), reservationItems);
            } catch (Exception ex) {
                log.error("Stock reservation failed for Order: {}. Reason: {}. Publishing STOCK_RESERVATION_FAILED event.", 
                        payload.getOrderNumber(), ex.getMessage());
                
                // Publish STOCK_RESERVATION_FAILED event to notify order-service
                eventPublisher.publishStockReservationFailedEvent(payload.getOrderNumber(), ex.getMessage());
            }
        } else if ("ORDER_CANCELLED".equals(eventEnvelope.getEventType())) {
            log.info("Processing COMPENSATING STOCK RELEASE for Order: {}", payload.getOrderNumber());
            try {
                // Perform compensating stock release
                inventoryService.releaseReservationsForOrder(payload.getOrderNumber());
            } catch (Exception ex) {
                log.error("Failed to release stock for cancelled Order: {}. Error: {}", payload.getOrderNumber(), ex.getMessage(), ex);
            }
        }
    }
}
