package com.pratham.user_service.controller;

import com.pratham.user_service.config.GatewayAuthFilter;
import com.pratham.user_service.dto.request.UserCreateRequest;
import com.pratham.user_service.dto.request.UserUpdateRequest;
import com.pratham.user_service.dto.response.UserResponse;
import com.pratham.user_service.exception.BusinessException;
import com.pratham.user_service.response.ApiResponse;
import com.pratham.user_service.service.UserService;
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
@RequestMapping("/api/identity/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing user accounts, authentication roles, and profile statuses.")
public class UserController {

    private final UserService userService;

    // ── Helper ─────────────────────────────────────────────────────────────────

    /**
     * Extracts the authenticated user's ID from the gateway-forwarded header.
     * The API Gateway validates the JWT and injects X-User-Id into every authenticated request.
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

    private String getAuthenticatedUserRole(HttpServletRequest request) {
        String role = request.getHeader(GatewayAuthFilter.HEADER_USER_ROLE);
        return role != null ? role : "";
    }

    // ── /me Endpoints (safe: ID from gateway, not client) ─────────────────────

    @GetMapping("/me")
    @Operation(summary = "Get own profile", description = "Returns the profile of the currently authenticated user. User ID is read from the gateway-injected X-User-Id header — never trusted from the client.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile successfully retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        UserResponse response = userService.getUserById(userId);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Profile successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/me")
    @Operation(summary = "Update own profile", description = "Updates the profile of the currently authenticated user. User ID is read from the gateway-injected X-User-Id header.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile successfully updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            @RequestBody @Valid UserUpdateRequest updateRequest,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        UserResponse response = userService.updateUser(userId, updateRequest);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Profile successfully updated")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    // ── Standard CRUD (with ownership enforcement) ─────────────────────────────

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
    @Operation(summary = "Get user profile details by ID", description = "Retrieves profile details for the matched user. Regular users can only access their own profile; admins can access any profile.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot access another user's profile"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "Primary ID key of the user to fetch", required = true)
            @PathVariable("id") Long id,
            HttpServletRequest request) {

        Long authenticatedUserId = getAuthenticatedUserId(request);
        String authenticatedRole = getAuthenticatedUserRole(request);

        // Ownership check: regular users can only access their own profile
        if (!"ROLE_ADMIN".equals(authenticatedRole) && !authenticatedUserId.equals(id)) {
            throw new BusinessException("Access denied: You can only view your own profile.");
        }

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
    @Operation(summary = "Get all registered users", description = "Retrieves a listing of all active registered user accounts. Admin only.")
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
    @Operation(summary = "Update user profile details by ID", description = "Modifies non-sensitive user profile details (first name, last name, phone number). Regular users can only update their own profile; admins can update any.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request arguments"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot update another user's profile"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "Primary ID key of the user to update", required = true)
            @PathVariable("id") Long id,
            @RequestBody @Valid UserUpdateRequest updateRequest,
            HttpServletRequest request) {

        Long authenticatedUserId = getAuthenticatedUserId(request);
        String authenticatedRole = getAuthenticatedUserRole(request);

        // Ownership check: regular users can only update their own profile
        if (!"ROLE_ADMIN".equals(authenticatedRole) && !authenticatedUserId.equals(id)) {
            throw new BusinessException("Access denied: You can only update your own profile.");
        }

        UserResponse response = userService.updateUser(id, updateRequest);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("User profile successfully updated")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user account", description = "Deletes a registered user account permanently by ID. Admin only.")
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
