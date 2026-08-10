package com.pratham.inventory_service.dto.response;

import com.pratham.inventory_service.enums.ReservationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {

    private Long id;
    private String reservationCode;
    private String orderId;
    private String sku;
    private Long warehouseId;
    private Integer quantity;
    private ReservationStatus status;
    private LocalDateTime expiresAt;
}
