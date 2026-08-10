package com.pratham.payment_service.dto.event;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OrderEventPayload {
    private String orderNumber;
    private Long customerId;
    private BigDecimal totalAmount;
    private List<OrderEventItem> items;
}
