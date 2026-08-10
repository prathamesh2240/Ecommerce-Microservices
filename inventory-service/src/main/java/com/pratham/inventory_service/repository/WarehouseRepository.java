package com.pratham.inventory_service.repository;

import com.pratham.inventory_service.entity.Warehouse;
import com.pratham.inventory_service.enums.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    Optional<Warehouse> findByCode(String code);

    List<Warehouse> findByRegionCodeAndStatus(String regionCode, WarehouseStatus status);

    boolean existsByCode(String code);
}
