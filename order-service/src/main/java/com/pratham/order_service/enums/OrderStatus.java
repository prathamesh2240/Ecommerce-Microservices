package com.pratham.order_service.enums;

public enum OrderStatus {
    PENDING_RESERVATION,
    PENDING_PAYMENT,
    CONFIRMED,
    CANCELLED_NO_STOCK,
    CANCELLED_PAYMENT_FAILED
}
