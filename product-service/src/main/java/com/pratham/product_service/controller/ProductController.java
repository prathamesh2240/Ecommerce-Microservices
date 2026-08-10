package com.pratham.product_service.controller;

import com.pratham.product_service.dto.request.ProductCreateRequest;
import com.pratham.product_service.dto.request.ProductUpdateRequest;
import com.pratham.product_service.dto.request.ProductSearchRequest;
import com.pratham.product_service.dto.response.ProductResponse;
import com.pratham.product_service.response.ApiResponse;
import com.pratham.product_service.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/catalog/products")
@RequiredArgsConstructor
@Tag(name = "Product Catalog Management", description = "APIs for managing the product directory, categorizations, and dynamic filtering searches.")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Register a new catalog product", description = "Creates a product mapping inside the catalog, automatically generating its SEO slug.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product successfully created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request parameters or non-leaf category mapping attempted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict. Product SKU is already in use")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody @Valid ProductCreateRequest request) {
        ProductResponse response = productService.createProduct(request);

        ApiResponse<ProductResponse> apiResponse = ApiResponse.<ProductResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Product successfully registered")
                .data(response)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all products paginated", description = "Retrieves paginated catalog products listing.")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(ProductSearchRequest request) {
        return searchProducts(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieves complete product attributes for a specific primary catalog ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @Parameter(description = "Primary ID key of the product", required = true)
            @PathVariable("id") Long id) {
        ProductResponse response = productService.getProductById(id);

        ApiResponse<ProductResponse> apiResponse = ApiResponse.<ProductResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Product details successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get product by SEO slug", description = "Retrieves product details using its SEO-friendly URL slug.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found with the specified slug")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(
            @Parameter(description = "SEO URL slug of the product", required = true)
            @PathVariable("slug") String slug) {
        ProductResponse response = productService.getProductBySlug(slug);

        ApiResponse<ProductResponse> apiResponse = ApiResponse.<ProductResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Product details successfully retrieved")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/search")
    @Operation(summary = "Dynamic paginated catalog search", description = "Filters product listings dynamically by keyword, brand, category slug, and price ranges.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search query completed successfully")
    })
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(ProductSearchRequest request) {
        Page<ProductResponse> responsePage = productService.searchProducts(request);

        ApiResponse<Page<ProductResponse>> apiResponse = ApiResponse.<Page<ProductResponse>>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Catalog search query successfully resolved")
                .data(responsePage)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product details", description = "Updates editable catalog attributes (name, price, brand, description, images) by primary ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product successfully updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request arguments or non-leaf category mapping attempted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @Parameter(description = "Primary ID key of the product to update", required = true)
            @PathVariable("id") Long id,
            @RequestBody @Valid ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(id, request);

        ApiResponse<ProductResponse> apiResponse = ApiResponse.<ProductResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Product successfully updated")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove product listing", description = "Removes a product listing permanently from the catalog by primary ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product successfully deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found with the specified ID")
    })
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @Parameter(description = "Primary ID key of the product to delete", required = true)
            @PathVariable("id") Long id) {
        productService.deleteProduct(id);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Product successfully deleted")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
