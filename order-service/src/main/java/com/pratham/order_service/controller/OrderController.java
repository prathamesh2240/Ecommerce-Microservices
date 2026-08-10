package com.pratham.order_service.controller;

import com.pratham.order_service.dto.OrderCreateRequest;
import com.pratham.order_service.dto.OrderResponse;
import com.pratham.order_service.response.ApiResponse;
import com.pratham.order_service.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for executing, querying, and managing shopping orders and their Saga workflows.")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Submit new order placement", description = "Initiates order creation under PENDING_RESERVATION status and triggers Saga execution.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Order successfully submitted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request structure or payload errors")
    })
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestBody @Valid OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);

        ApiResponse<OrderResponse> apiResponse = ApiResponse.<OrderResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Order submitted successfully. Processing stock allocation.")
                .data(response)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Query order status details", description = "Fetches complete entity attributes and processing status using the unique order business number.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order records found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order number not found")
    })
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @PathVariable("orderNumber") String orderNumber) {
        OrderResponse response = orderService.getOrderByNumber(orderNumber);

        ApiResponse<OrderResponse> apiResponse = ApiResponse.<OrderResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Order records retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
