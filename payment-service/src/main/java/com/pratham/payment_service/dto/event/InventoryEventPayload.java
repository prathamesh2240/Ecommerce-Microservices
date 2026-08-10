package com.pratham.payment_service.dto.event;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class InventoryEventPayload {
    private String reservationCode;
    private String orderId;
    private String sku;
    private Long warehouseId;
    private Integer quantity;
    private LocalDateTime expiresAt;
}
