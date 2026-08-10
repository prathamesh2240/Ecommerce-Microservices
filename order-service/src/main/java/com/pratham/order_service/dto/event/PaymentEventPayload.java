package com.pratham.order_service.dto.event;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PaymentEventPayload {
    private String paymentId;
    private String orderNumber;
    private BigDecimal amount;
    private String status;
    private String failureReason;
}
