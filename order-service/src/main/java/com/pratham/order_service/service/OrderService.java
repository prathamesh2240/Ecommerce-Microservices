package com.pratham.order_service.service;

import com.pratham.order_service.dto.OrderCreateRequest;
import com.pratham.order_service.dto.OrderResponse;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest request);
    OrderResponse getOrderByNumber(String orderNumber);
}
