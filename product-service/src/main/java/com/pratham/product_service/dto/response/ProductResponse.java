package com.pratham.product_service.dto.response;

import com.pratham.product_service.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String brand;
    private String description;
    private BigDecimal price;
    private String currency;
    private String imageUrl;
    private String thumbnailUrl;
    private ProductStatus status;
    private CategoryResponse category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
