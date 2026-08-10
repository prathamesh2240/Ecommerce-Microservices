package com.pratham.inventory_service.service;

import com.pratham.inventory_service.dto.request.WarehouseRequest;
import com.pratham.inventory_service.dto.response.WarehouseResponse;

public interface WarehouseService {
    WarehouseResponse createWarehouse(WarehouseRequest request);
    WarehouseResponse getWarehouseById(Long id);
    WarehouseResponse getWarehouseByCode(String code);
}
