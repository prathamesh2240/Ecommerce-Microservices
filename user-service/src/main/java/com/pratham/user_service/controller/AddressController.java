package com.pratham.user_service.controller;

import com.pratham.user_service.config.GatewayAuthFilter;
import com.pratham.user_service.dto.request.AddressCreateRequest;
import com.pratham.user_service.dto.request.AddressUpdateRequest;
import com.pratham.user_service.dto.response.AddressResponse;
import com.pratham.user_service.exception.BusinessException;
import com.pratham.user_service.response.ApiResponse;
import com.pratham.user_service.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/identity/users/me/addresses")
@RequiredArgsConstructor
@Tag(name = "Address Management", description = "APIs for managing user shipping and billing addresses.")
public class AddressController {

    private final AddressService addressService;

    /**
     * Extracts the authenticated user's ID from the gateway-forwarded header.
     * Never trusts user ID from client bodies or path variables.
     */
    private Long getAuthenticatedUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader(GatewayAuthFilter.HEADER_USER_ID);
        if (userIdHeader == null || userIdHeader.isBlank() || "null".equalsIgnoreCase(userIdHeader)) {
            throw new BusinessException("Authenticated user context is missing. Please login again.");
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            throw new BusinessException("Invalid user context. Please login again.");
        }
    }

    @GetMapping
    @Operation(summary = "Get all saved addresses", description = "Returns all addresses saved by the currently authenticated user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Addresses retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        List<AddressResponse> responseList = addressService.getAddressesByUserId(userId);

        ApiResponse<List<AddressResponse>> apiResponse = ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Addresses retrieved successfully")
                .data(responseList)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{addressId}")
    @Operation(summary = "Get saved address by ID", description = "Retrieves a specific address by ID if owned by the authenticated user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @Parameter(description = "ID of the address to fetch", required = true)
            @PathVariable("addressId") Long addressId,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        AddressResponse response = addressService.getAddressByIdAndUserId(userId, addressId);

        ApiResponse<AddressResponse> apiResponse = ApiResponse.<AddressResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Address retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping
    @Operation(summary = "Save new address", description = "Adds a new delivery address for the authenticated user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Address successfully saved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid address payload")
    })
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @RequestBody @Valid AddressCreateRequest createRequest,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        AddressResponse response = addressService.createAddress(userId, createRequest);

        ApiResponse<AddressResponse> apiResponse = ApiResponse.<AddressResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Address saved successfully")
                .data(response)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{addressId}")
    @Operation(summary = "Update saved address", description = "Updates details of an existing address owned by the authenticated user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address successfully updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid address payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @Parameter(description = "ID of the address to update", required = true)
            @PathVariable("addressId") Long addressId,
            @RequestBody @Valid AddressUpdateRequest updateRequest,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        AddressResponse response = addressService.updateAddress(userId, addressId, updateRequest);

        ApiResponse<AddressResponse> apiResponse = ApiResponse.<AddressResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Address updated successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{addressId}")
    @Operation(summary = "Delete saved address", description = "Permanently removes an address owned by the authenticated user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @Parameter(description = "ID of the address to delete", required = true)
            @PathVariable("addressId") Long addressId,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        addressService.deleteAddress(userId, addressId);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Address removed successfully")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{addressId}/default")
    @Operation(summary = "Set address as default", description = "Marks the specified address as default and clears other defaults for this user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address set as default successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @Parameter(description = "ID of the address to set as default", required = true)
            @PathVariable("addressId") Long addressId,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        AddressResponse response = addressService.setDefaultAddress(userId, addressId);

        ApiResponse<AddressResponse> apiResponse = ApiResponse.<AddressResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Default address updated successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
