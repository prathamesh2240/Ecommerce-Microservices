package com.pratham.inventory_service.repository;

import com.pratham.inventory_service.entity.Inventory;
import com.pratham.inventory_service.enums.InventoryStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findBySkuAndWarehouseId(String sku, Long warehouseId);

    boolean existsBySkuAndWarehouseId(String sku, Long warehouseId);

    List<Inventory> findBySku(String sku);

    List<Inventory> findByWarehouseId(Long warehouseId);

    List<Inventory> findByStatus(InventoryStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.sku = :sku AND i.warehouse.id = :warehouseId")
    Optional<Inventory> findBySkuAndWarehouseIdForUpdate(
            @Param("sku") String sku, @Param("warehouseId") Long warehouseId);

    @Query("SELECT i FROM Inventory i WHERE i.availableQuantity <= i.reorderLevel AND i.status = 'ACTIVE'")
    List<Inventory> findLowStockItems();
}
