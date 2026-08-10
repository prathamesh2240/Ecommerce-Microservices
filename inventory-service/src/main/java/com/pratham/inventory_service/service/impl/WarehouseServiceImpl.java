package com.pratham.inventory_service.service.impl;

import com.pratham.inventory_service.dto.request.WarehouseRequest;
import com.pratham.inventory_service.dto.response.WarehouseResponse;
import com.pratham.inventory_service.entity.Warehouse;
import com.pratham.inventory_service.enums.WarehouseStatus;
import com.pratham.inventory_service.exception.DuplicateResourceException;
import com.pratham.inventory_service.exception.ResourceNotFoundException;
import com.pratham.inventory_service.repository.WarehouseRepository;
import com.pratham.inventory_service.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        log.info("Attempting to register warehouse with code: {}", request.getCode());

        if (warehouseRepository.existsByCode(request.getCode())) {
            log.warn("Warehouse creation failed. Code: {} already exists", request.getCode());
            throw new DuplicateResourceException("Warehouse code is already registered");
        }

        Warehouse warehouse = Warehouse.builder()
                .code(request.getCode().toUpperCase().trim())
                .name(request.getName())
                .regionCode(request.getRegionCode().toUpperCase().trim())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .status(WarehouseStatus.ACTIVE)
                .build();

        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        log.info("Warehouse registered successfully with ID: {}", savedWarehouse.getId());

        return mapToWarehouseResponse(savedWarehouse);
    }

    @Override
    public WarehouseResponse getWarehouseById(Long id) {
        log.info("Fetching warehouse with ID: {}", id);
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Warehouse not found. ID: {}", id);
                    return new ResourceNotFoundException("Warehouse not found with ID: " + id);
                });
        return mapToWarehouseResponse(warehouse);
    }

    @Override
    public WarehouseResponse getWarehouseByCode(String code) {
        log.info("Fetching warehouse with code: {}", code);
        Warehouse warehouse = warehouseRepository.findByCode(code.toUpperCase().trim())
                .orElseThrow(() -> {
                    log.warn("Warehouse not found. Code: {}", code);
                    return new ResourceNotFoundException("Warehouse not found with code: " + code);
                });
        return mapToWarehouseResponse(warehouse);
    }

    private WarehouseResponse mapToWarehouseResponse(Warehouse warehouse) {
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .code(warehouse.getCode())
                .name(warehouse.getName())
                .regionCode(warehouse.getRegionCode())
                .location(warehouse.getLocation())
                .capacity(warehouse.getCapacity())
                .status(warehouse.getStatus())
                .build();
    }
}
