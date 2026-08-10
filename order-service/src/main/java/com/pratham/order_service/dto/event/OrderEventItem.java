package com.pratham.order_service.dto.event;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OrderEventItem {
    private String sku;
    private BigDecimal price;
    private Integer quantity;
}
