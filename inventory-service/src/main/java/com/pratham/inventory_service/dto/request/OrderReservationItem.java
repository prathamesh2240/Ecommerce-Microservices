package com.pratham.inventory_service.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReservationItem {
    private String sku;
    private Integer quantity;
}
