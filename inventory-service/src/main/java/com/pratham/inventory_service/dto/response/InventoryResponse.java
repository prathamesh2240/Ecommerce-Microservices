package com.pratham.inventory_service.dto.response;

import com.pratham.inventory_service.enums.InventoryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private Long id;
    private String sku;
    private Long warehouseId;
    private String warehouseCode;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer committedQuantity;
    private Integer reorderLevel;
    private InventoryStatus status;
    private LocalDateTime lastMovementAt;
}
