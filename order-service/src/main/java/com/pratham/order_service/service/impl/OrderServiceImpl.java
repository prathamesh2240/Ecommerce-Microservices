package com.pratham.order_service.service.impl;

import com.pratham.order_service.dto.OrderCreateRequest;
import com.pratham.order_service.dto.OrderItemResponse;
import com.pratham.order_service.dto.OrderResponse;
import com.pratham.order_service.entity.Order;
import com.pratham.order_service.entity.OrderItem;
import com.pratham.order_service.enums.OrderStatus;
import com.pratham.order_service.exception.ResourceNotFoundException;
import com.pratham.order_service.publisher.OrderEventPublisher;
import com.pratham.order_service.repository.OrderRepository;
import com.pratham.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        log.info("Creating order for customer ID: {}", request.getCustomerId());

        // Generate unique business order number
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Calculate total amount
        BigDecimal totalAmount = request.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(request.getCustomerId())
                .orderStatus(OrderStatus.PENDING_RESERVATION)
                .totalAmount(totalAmount)
                .build();

        // Add order items
        request.getItems().forEach(itemDto -> {
            OrderItem orderItem = OrderItem.builder()
                    .sku(itemDto.getSku())
                    .price(itemDto.getPrice())
                    .quantity(itemDto.getQuantity())
                    .build();
            order.addOrderItem(orderItem);
        });

        // Save order inside PostgreSQL
        Order savedOrder = orderRepository.save(order);
        log.info("Order saved successfully in DB. Order Number: {}", savedOrder.getOrderNumber());

        // Map to Response
        OrderResponse response = mapToOrderResponse(savedOrder);

        // Publish ORDER_CREATED event to Kafka
        eventPublisher.publishOrderCreatedEvent(savedOrder);

        return response;
    }

    @Override
    public OrderResponse getOrderByNumber(String orderNumber) {
        log.info("Fetching order by order number: {}", orderNumber);
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomerId())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getOrderItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .sku(item.getSku())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
