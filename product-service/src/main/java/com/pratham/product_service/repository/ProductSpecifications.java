package com.pratham.product_service.repository;

import com.pratham.product_service.entity.Product;
import com.pratham.product_service.enums.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecifications {

    public static Specification<Product> hasBrand(String brand) {
        return (root, query, cb) -> brand == null || brand.isBlank() ? null :
                cb.equal(cb.lower(root.get("brand")), brand.toLowerCase().trim());
    }

    public static Specification<Product> hasCategorySlug(String categorySlug) {
        return (root, query, cb) -> categorySlug == null || categorySlug.isBlank() ? null :
                cb.equal(cb.lower(root.join("category").get("slug")), categorySlug.toLowerCase().trim());
    }

    public static Specification<Product> hasStatus(ProductStatus status) {
        return (root, query, cb) -> status == null ? null :
                cb.equal(root.get("status"), status);
    }

    public static Specification<Product> priceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return null;
            }
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            }
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    public static Specification<Product> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String wildcard = "%" + keyword.toLowerCase().trim() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), wildcard),
                    cb.like(cb.lower(root.get("brand")), wildcard),
                    cb.like(cb.lower(root.get("description")), wildcard)
            );
        };
    }
}
