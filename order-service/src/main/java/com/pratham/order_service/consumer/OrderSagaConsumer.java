package com.pratham.order_service.consumer;

import com.pratham.order_service.dto.event.EventEnvelope;
import com.pratham.order_service.dto.event.InventoryEventPayload;
import com.pratham.order_service.dto.event.PaymentEventPayload;
import com.pratham.order_service.entity.Order;
import com.pratham.order_service.enums.OrderStatus;
import com.pratham.order_service.exception.ResourceNotFoundException;
import com.pratham.order_service.publisher.OrderEventPublisher;
import com.pratham.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaConsumer {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;

    @KafkaListener(
            topics = "ecommerce.inventory.events.v1",
            groupId = "order-group"
    )
    @Transactional
    public void consumeInventoryEvent(@Payload EventEnvelope<InventoryEventPayload> eventEnvelope) {
        log.info("Received Inventory Event: {} for Correlation ID: {}", eventEnvelope.getEventType(), eventEnvelope.getCorrelationId());
        String orderNumber = eventEnvelope.getCorrelationId();

        if (orderNumber == null) {
            log.error("Order number correlation ID is null. Skipping processing.");
            return;
        }

        Order order = orderRepository.findByOrderNumber(orderNumber).orElse(null);
        if (order == null) {
            log.warn("Order not found with number: {}. Event skipped.", orderNumber);
            return;
        }

        if ("STOCK_RESERVED".equals(eventEnvelope.getEventType())) {
            if (order.getOrderStatus() == OrderStatus.PENDING_RESERVATION) {
                log.info("Stock successfully reserved. Transitioning Order {} to PENDING_PAYMENT", orderNumber);
                order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
                orderRepository.save(order);
            }
        } else if ("STOCK_RESERVATION_FAILED".equals(eventEnvelope.getEventType())) {
            if (order.getOrderStatus() == OrderStatus.PENDING_RESERVATION) {
                log.warn("Stock reservation failed for Order {}. Transitioning to CANCELLED_NO_STOCK", orderNumber);
                order.setOrderStatus(OrderStatus.CANCELLED_NO_STOCK);
                orderRepository.save(order);
            }
        }
    }

    @KafkaListener(
            topics = "ecommerce.payment.events.v1",
            groupId = "order-group"
    )
    @Transactional
    public void consumePaymentEvent(@Payload EventEnvelope<PaymentEventPayload> eventEnvelope) {
        log.info("Received Payment Event: {} for Correlation ID: {}", eventEnvelope.getEventType(), eventEnvelope.getCorrelationId());
        String orderNumber = eventEnvelope.getCorrelationId();

        if (orderNumber == null) {
            log.error("Order number correlation ID is null. Skipping processing.");
            return;
        }

        Order order = orderRepository.findByOrderNumber(orderNumber).orElse(null);
        if (order == null) {
            log.warn("Order not found with number: {}. Event skipped.", orderNumber);
            return;
        }

        if ("PAYMENT_COMPLETED".equals(eventEnvelope.getEventType())) {
            if (order.getOrderStatus() == OrderStatus.PENDING_PAYMENT) {
                log.info("Payment successful. Transitioning Order {} to CONFIRMED", orderNumber);
                order.setOrderStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
            }
        } else if ("PAYMENT_FAILED".equals(eventEnvelope.getEventType())) {
            if (order.getOrderStatus() == OrderStatus.PENDING_PAYMENT) {
                log.warn("Payment failed for Order {}. Transitioning to CANCELLED_PAYMENT_FAILED and initiating compensation.", orderNumber);
                order.setOrderStatus(OrderStatus.CANCELLED_PAYMENT_FAILED);
                orderRepository.save(order);

                // Compensating Transaction: Publish ORDER_CANCELLED event so inventory-service can release reserved stock
                eventPublisher.publishOrderCancelledEvent(order);
            }
        }
    }
}
