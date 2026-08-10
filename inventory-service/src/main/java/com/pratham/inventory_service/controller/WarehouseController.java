package com.pratham.inventory_service.controller;

import com.pratham.inventory_service.dto.request.WarehouseRequest;
import com.pratham.inventory_service.dto.response.WarehouseResponse;
import com.pratham.inventory_service.response.ApiResponse;
import com.pratham.inventory_service.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/inventory/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouse Management", description = "APIs for registering and managing physical warehouse fulfillment centers.")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @Operation(summary = "Register a new warehouse", description = "Creates a physical fulfillment center record with dynamic volume capacity.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Warehouse successfully registered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload or schema validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict. Warehouse code is already registered")
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> createWarehouse(@RequestBody @Valid WarehouseRequest request) {
        WarehouseResponse response = warehouseService.createWarehouse(request);

        ApiResponse<WarehouseResponse> apiResponse = ApiResponse.<WarehouseResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Warehouse successfully registered")
                .data(response)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID", description = "Retrieves warehouse metadata attributes for a specific primary catalog ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> getWarehouseById(
            @Parameter(description = "Primary ID key of the warehouse", required = true)
            @PathVariable("id") Long id) {
        WarehouseResponse response = warehouseService.getWarehouseById(id);

        ApiResponse<WarehouseResponse> apiResponse = ApiResponse.<WarehouseResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Warehouse details successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get warehouse by code", description = "Retrieves warehouse metadata attributes using its unique alphanumeric code.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found with the specified code")
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> getWarehouseByCode(
            @Parameter(description = "Alphanumeric business code of the warehouse", required = true)
            @PathVariable("code") String code) {
        WarehouseResponse response = warehouseService.getWarehouseByCode(code);

        ApiResponse<WarehouseResponse> apiResponse = ApiResponse.<WarehouseResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Warehouse details successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
