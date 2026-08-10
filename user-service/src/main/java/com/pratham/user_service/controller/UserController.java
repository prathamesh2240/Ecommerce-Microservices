package com.pratham.user_service.controller;

import com.pratham.user_service.dto.request.UserCreateRequest;
import com.pratham.user_service.dto.request.UserUpdateRequest;
import com.pratham.user_service.dto.response.UserResponse;
import com.pratham.user_service.response.ApiResponse;
import com.pratham.user_service.service.UserService;
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
import java.util.List;

@RestController
@RequestMapping("/api/identity/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing user accounts, authentication roles, and profile statuses.")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user account", description = "Registers a new user in the system with default USER privileges and active account status.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User successfully registered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload or schema validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict. Email address is already in use")
    })
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody @Valid UserCreateRequest request) {
        UserResponse response = userService.createUser(request);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("User successfully registered")
                .data(response)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile details by ID", description = "Retrieves profile details including timestamps and roles for the matched user.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "Primary ID key of the user to fetch", required = true)
            @PathVariable("id") Long id) {
        UserResponse response = userService.getUserById(id);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("User profile successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    @Operation(summary = "Get all registered users", description = "Retrieves a listing of all active registered user accounts.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User list successfully retrieved")
    })
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> responseList = userService.getAllUsers();

        ApiResponse<List<UserResponse>> apiResponse = ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("All users successfully retrieved")
                .data(responseList)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile details", description = "Modifies non-sensitive user profile details (first name, last name, phone number) by ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request arguments"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "Primary ID key of the user to update", required = true)
            @PathVariable("id") Long id,
            @RequestBody @Valid UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("User profile successfully updated")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user account", description = "Deletes a registered user account permanently by ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User account deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "Primary ID key of the user to delete", required = true)
            @PathVariable("id") Long id) {
        userService.deleteUser(id);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("User account successfully deleted")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
