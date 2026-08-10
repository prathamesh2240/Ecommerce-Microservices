package com.pratham.product_service.service.impl;

import com.pratham.product_service.dto.request.ProductCreateRequest;
import com.pratham.product_service.dto.request.ProductUpdateRequest;
import com.pratham.product_service.dto.request.ProductSearchRequest;
import com.pratham.product_service.dto.response.CategoryResponse;
import com.pratham.product_service.dto.response.ProductResponse;
import com.pratham.product_service.entity.Category;
import com.pratham.product_service.entity.Product;
import com.pratham.product_service.enums.ProductStatus;
import com.pratham.product_service.exception.BusinessException;
import com.pratham.product_service.exception.DuplicateResourceException;
import com.pratham.product_service.exception.ResourceNotFoundException;
import com.pratham.product_service.repository.CategoryRepository;
import com.pratham.product_service.repository.ProductRepository;
import com.pratham.product_service.repository.ProductSpecifications;
import com.pratham.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        log.info("Attempting to create product with SKU: {}", request.getSku());

        if (productRepository.existsBySku(request.getSku())) {
            log.warn("Product creation failed. SKU: {} already exists", request.getSku());
            throw new DuplicateResourceException("Product SKU is already registered");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.warn("Product creation failed. Category ID: {} not found", request.getCategoryId());
                    return new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId());
                });

        // Enforce Leaf Category rule
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            log.warn("Category validation failed. Category ID: {} is not a leaf category", request.getCategoryId());
            throw new BusinessException("Products can only be assigned to leaf categories (categories with no subcategories)");
        }

        String uniqueSlug = generateUniqueSlug(request.getName());

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .slug(uniqueSlug)
                .brand(request.getBrand())
                .description(request.getDescription())
                .price(request.getPrice())
                .currency(request.getCurrency())
                .imageUrl(request.getImageUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .status(ProductStatus.ACTIVE)
                .category(category)
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Product successfully registered with ID: {} and slug: {}", savedProduct.getId(), savedProduct.getSlug());

        return mapToProductResponse(savedProduct);
    }

    @Override
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(Long id) {
        log.info("Fetching product with ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product fetch failed. ID: {} not found", id);
                    return new ResourceNotFoundException("Product not found with ID: " + id);
                });
        return mapToProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "'slug::' + #slug")
    public ProductResponse getProductBySlug(String slug) {
        log.info("Fetching product with slug: {}", slug);
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Product fetch failed. Slug: {} not found", slug);
                    return new ResourceNotFoundException("Product not found with slug: " + slug);
                });
        return mapToProductResponse(product);
    }

    @Override
    public Page<ProductResponse> searchProducts(ProductSearchRequest request) {
        log.info("Executing paginated dynamic catalog search");

        int pageVal = request.getPage() != null ? request.getPage() : 0;
        int sizeVal = request.getSize() != null ? request.getSize() : 10;
        String sortVal = request.getSort() != null ? request.getSort() : "id,asc";

        String[] sortParts = sortVal.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageVal, sizeVal, Sort.by(direction, sortField));

        Specification<Product> spec = Specification.where(ProductSpecifications.hasStatus(ProductStatus.ACTIVE))
                .and(ProductSpecifications.hasKeyword(request.getKeyword()))
                .and(ProductSpecifications.hasBrand(request.getBrand()))
                .and(ProductSpecifications.hasCategorySlug(request.getCategorySlug()))
                .and(ProductSpecifications.priceBetween(request.getMinPrice(), request.getMaxPrice()));

        return productRepository.findAll(spec, pageable)
                .map(this::mapToProductResponse);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", key = "#id"),
        @CacheEvict(value = "products", key = "'slug::' + #result.slug")
    })
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        log.info("Attempting to update product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product update failed. ID: {} not found", id);
                    return new ResourceNotFoundException("Product not found with ID: " + id);
                });

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.warn("Product update failed. Category ID: {} not found", request.getCategoryId());
                    return new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId());
                });

        // Enforce Leaf Category rule
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            log.warn("Category validation failed during update. Category ID: {} is not a leaf category", request.getCategoryId());
            throw new BusinessException("Products can only be assigned to leaf categories (categories with no subcategories)");
        }

        // Regenerate slug if name has changed
        if (!product.getName().equalsIgnoreCase(request.getName())) {
            product.setSlug(generateUniqueSlug(request.getName()));
        }

        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setThumbnailUrl(request.getThumbnailUrl());

        Product updatedProduct = productRepository.save(product);
        log.info("Product successfully updated. ID: {}", updatedProduct.getId());

        return mapToProductResponse(updatedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        log.info("Attempting to delete product with ID: {}", id);

        if (!productRepository.existsById(id)) {
            log.warn("Product deletion failed. ID: {} does not exist", id);
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }

        productRepository.deleteById(id);
        log.info("Product with ID: {} successfully deleted", id);
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        String slug = baseSlug;
        int count = 1;
        while (productRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count;
            count++;
        }
        return slug;
    }

    private ProductResponse mapToProductResponse(Product product) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .slug(product.getCategory().getSlug())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .brand(product.getBrand())
                .description(product.getDescription())
                .price(product.getPrice())
                .currency(product.getCurrency())
                .imageUrl(product.getImageUrl())
                .thumbnailUrl(product.getThumbnailUrl())
                .status(product.getStatus())
                .category(categoryResponse)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
