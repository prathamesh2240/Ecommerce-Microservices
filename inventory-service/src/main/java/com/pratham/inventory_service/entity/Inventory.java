package com.pratham.inventory_service.entity;

import com.pratham.inventory_service.enums.InventoryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventories", uniqueConstraints = {
        @UniqueConstraint(name = "uc_inventories_sku_warehouse", columnNames = {"sku", "warehouse_id"})
}, indexes = {
        @Index(name = "idx_inventories_sku", columnList = "sku"),
        @Index(name = "idx_inventories_warehouse_id", columnList = "warehouse_id"),
        @Index(name = "idx_inventories_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sku", nullable = false, length = 50)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity;

    @Column(name = "committed_quantity", nullable = false)
    private Integer committedQuantity;

    @Column(name = "reorder_level")
    private Integer reorderLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InventoryStatus status;

    @Column(name = "last_movement_at")
    private LocalDateTime lastMovementAt;

    @Version
    @Column(name = "version")
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
