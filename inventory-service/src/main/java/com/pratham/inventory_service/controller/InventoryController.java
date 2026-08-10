package com.pratham.inventory_service.controller;

import com.pratham.inventory_service.dto.response.InventoryResponse;
import com.pratham.inventory_service.response.ApiResponse;
import com.pratham.inventory_service.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/items")
@RequiredArgsConstructor
@Tag(name = "Inventory Item Management", description = "APIs for querying stock quantities and tracking SKU warehouse details.")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get inventory by SKU", description = "Retrieves current available and reserved stock counts for a specific SKU across all warehouses.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inventory details successfully retrieved")
    })
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getInventoryBySku(
            @Parameter(description = "SKU code of the catalog product", required = true)
            @PathVariable("sku") String sku) {
        List<InventoryResponse> response = inventoryService.getInventoryBySku(sku);

        ApiResponse<List<InventoryResponse>> apiResponse = ApiResponse.<List<InventoryResponse>>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Inventory details successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
