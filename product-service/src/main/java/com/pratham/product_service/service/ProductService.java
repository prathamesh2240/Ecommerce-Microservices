package com.pratham.product_service.service;

import com.pratham.product_service.dto.request.ProductCreateRequest;
import com.pratham.product_service.dto.request.ProductUpdateRequest;
import com.pratham.product_service.dto.request.ProductSearchRequest;
import com.pratham.product_service.dto.response.ProductResponse;
import org.springframework.data.domain.Page;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest request);
    ProductResponse getProductById(Long id);
    ProductResponse getProductBySlug(String slug);
    Page<ProductResponse> searchProducts(ProductSearchRequest request);
    ProductResponse updateProduct(Long id, ProductUpdateRequest request);
    void deleteProduct(Long id);
}
