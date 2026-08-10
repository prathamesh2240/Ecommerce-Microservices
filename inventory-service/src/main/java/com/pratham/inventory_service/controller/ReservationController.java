package com.pratham.inventory_service.controller;

import com.pratham.inventory_service.dto.request.ReservationRequest;
import com.pratham.inventory_service.dto.response.ReservationResponse;
import com.pratham.inventory_service.response.ApiResponse;
import com.pratham.inventory_service.service.InventoryService;
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
@RequestMapping("/api/inventory/reservations")
@RequiredArgsConstructor
@Tag(name = "Stock Reservations", description = "APIs for executing temporary stock holds, committing sales, and releasing expired holds.")
public class ReservationController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Reserve stock for checkout", description = "Acquires temporary locks on SKU quantities, mapping holds to active shopping orders.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Stock successfully reserved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request attributes or insufficient available stock")
    })
    public ResponseEntity<ApiResponse<ReservationResponse>> reserveStock(
            @RequestBody @Valid ReservationRequest request) {
        ReservationResponse response = inventoryService.reserveStock(request);

        ApiResponse<ReservationResponse> apiResponse = ApiResponse.<ReservationResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Stock successfully reserved")
                .data(response)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PostMapping("/{code}/commit")
    @Operation(summary = "Commit checkout stock allocation", description = "Converts reserved checkout quantity to committed status, locking inventory for shipment.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reservation successfully committed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Reservation cannot be committed in its current state"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Reservation code not found")
    })
    public ResponseEntity<ApiResponse<Void>> commitReservation(
            @Parameter(description = "Unique alphanumeric code of the reservation hold", required = true)
            @PathVariable("code") String code) {
        inventoryService.commitReservation(code);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Reservation committed successfully")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/{code}/release")
    @Operation(summary = "Release checkout stock hold", description = "Releases reserved checkout quantity back to the warehouse available pool.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reservation successfully released"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Reservation cannot be released in its current state"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Reservation code not found")
    })
    public ResponseEntity<ApiResponse<Void>> releaseReservation(
            @Parameter(description = "Unique alphanumeric code of the reservation hold", required = true)
            @PathVariable("code") String code) {
        inventoryService.releaseReservation(code);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Reservation released successfully")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
