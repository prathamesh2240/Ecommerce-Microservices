package com.pratham.inventory_service.dto.response;

import com.pratham.inventory_service.enums.WarehouseStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseResponse {

    private Long id;
    private String code;
    private String name;
    private String regionCode;
    private String location;
    private Integer capacity;
    private WarehouseStatus status;
}
