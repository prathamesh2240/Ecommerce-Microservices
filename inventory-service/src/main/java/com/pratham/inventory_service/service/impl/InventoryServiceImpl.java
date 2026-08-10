package com.pratham.inventory_service.service.impl;

import com.pratham.inventory_service.dto.request.ReservationRequest;
import com.pratham.inventory_service.dto.response.ReservationResponse;
import com.pratham.inventory_service.entity.Inventory;
import com.pratham.inventory_service.entity.Reservation;
import com.pratham.inventory_service.enums.ReservationStatus;
import com.pratham.inventory_service.exception.BusinessException;
import com.pratham.inventory_service.exception.ResourceNotFoundException;
import com.pratham.inventory_service.repository.InventoryRepository;
import com.pratham.inventory_service.repository.ReservationRepository;
import com.pratham.inventory_service.publisher.InventoryEventPublisher;
import com.pratham.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ReservationRepository reservationRepository;
    private final InventoryEventPublisher eventPublisher;

    @Override
    @Transactional
    public ReservationResponse reserveStock(ReservationRequest request) {
        log.info("Attempting to reserve {} units of SKU: {} in warehouse ID: {}",
                request.getQuantity(), request.getSku(), request.getWarehouseId());

        // Acquire pessimistic write lock on the inventory row
        Inventory inventory = inventoryRepository.findBySkuAndWarehouseIdForUpdate(
                request.getSku(), request.getWarehouseId())
                .orElseThrow(() -> {
                    log.warn("Inventory record not found for SKU: {} and warehouse ID: {}",
                            request.getSku(), request.getWarehouseId());
                    return new ResourceNotFoundException("No inventory record found for the specified SKU and warehouse");
                });

        // Check availability
        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            log.warn("Insufficient stock for SKU: {}. Available: {}, Requested: {}",
                    request.getSku(), inventory.getAvailableQuantity(), request.getQuantity());
            throw new BusinessException("Insufficient stock available for the requested product");
        }

        // Update inventory numbers
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - request.getQuantity());
        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        inventory.setLastMovementAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Create reservation record
        String reservationCode = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Reservation reservation = Reservation.builder()
                .reservationCode(reservationCode)
                .orderId(request.getOrderId())
                .sku(request.getSku())
                .inventory(inventory)
                .quantity(request.getQuantity())
                .status(ReservationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(10)) // 10-minute TTL
                .reservedAt(LocalDateTime.now())
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Stock reserved successfully. Code: {}, Expires at: {}",
                savedReservation.getReservationCode(), savedReservation.getExpiresAt());

        ReservationResponse response = mapToReservationResponse(savedReservation);
        eventPublisher.publishStockReservedEvent(response);
        return response;
    }

    @Override
    @Transactional
    public void commitReservation(String reservationCode) {
        log.info("Attempting to commit reservation with code: {}", reservationCode);

        Reservation reservation = reservationRepository.findByReservationCode(reservationCode)
                .orElseThrow(() -> {
                    log.warn("Reservation commit failed. Code: {} not found", reservationCode);
                    return new ResourceNotFoundException("Reservation not found with code: " + reservationCode);
                });

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            log.warn("Reservation commit rejected. Current status is: {}", reservation.getStatus());
            throw new BusinessException("Reservation cannot be committed in its current status: " + reservation.getStatus());
        }

        Inventory inventory = inventoryRepository.findBySkuAndWarehouseIdForUpdate(
                reservation.getSku(), reservation.getInventory().getWarehouse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for reservation"));

        // Update inventory numbers (Reserved -> Committed)
        inventory.setReservedQuantity(inventory.getReservedQuantity() - reservation.getQuantity());
        inventory.setCommittedQuantity(inventory.getCommittedQuantity() + reservation.getQuantity());
        inventory.setLastMovementAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Update reservation status
        reservation.setStatus(ReservationStatus.COMMITTED);
        reservation.setReleasedAt(LocalDateTime.now());
        reservationRepository.save(reservation);

        log.info("Reservation committed successfully. Stock moved to committed pool");
    }

    @Override
    @Transactional
    public void releaseReservation(String reservationCode) {
        log.info("Attempting to release reservation with code: {}", reservationCode);

        Reservation reservation = reservationRepository.findByReservationCode(reservationCode)
                .orElseThrow(() -> {
                    log.warn("Reservation release failed. Code: {} not found", reservationCode);
                    return new ResourceNotFoundException("Reservation not found with code: " + reservationCode);
                });

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            log.warn("Reservation release rejected. Current status is: {}", reservation.getStatus());
            throw new BusinessException("Reservation cannot be released in its current status: " + reservation.getStatus());
        }

        Inventory inventory = inventoryRepository.findBySkuAndWarehouseIdForUpdate(
                reservation.getSku(), reservation.getInventory().getWarehouse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for reservation"));

        // Return stock to available pool (Reserved -> Available)
        inventory.setReservedQuantity(inventory.getReservedQuantity() - reservation.getQuantity());
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + reservation.getQuantity());
        inventory.setLastMovementAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Update reservation status
        reservation.setStatus(ReservationStatus.RELEASED);
        reservation.setReleasedAt(LocalDateTime.now());
        reservationRepository.save(reservation);

        log.info("Reservation released successfully. Stock returned to available pool");
    }

    @Override
    @Transactional
    public java.util.List<ReservationResponse> reserveStockForOrder(String orderId, java.util.List<com.pratham.inventory_service.dto.request.OrderReservationItem> items) {
        log.info("Attempting to reserve stock for Order: {} with {} items", orderId, items.size());
        java.util.List<Reservation> savedReservations = new java.util.ArrayList<>();

        for (com.pratham.inventory_service.dto.request.OrderReservationItem item : items) {
            java.util.List<Inventory> inventories = inventoryRepository.findBySku(item.getSku());
            
            Inventory targetInventory = null;
            for (Inventory inv : inventories) {
                if (inv.getAvailableQuantity() >= item.getQuantity()) {
                    targetInventory = inv;
                    break;
                }
            }

            if (targetInventory == null) {
                log.warn("Insufficient stock across all warehouses for SKU: {}. Requested: {}", 
                        item.getSku(), item.getQuantity());
                throw new BusinessException("Insufficient stock available for product SKU: " + item.getSku());
            }

            Inventory inventory = inventoryRepository.findBySkuAndWarehouseIdForUpdate(
                    item.getSku(), targetInventory.getWarehouse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for update"));

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                log.warn("Race condition: stock reduced for SKU: {} after check.", item.getSku());
                throw new BusinessException("Insufficient stock available for product SKU: " + item.getSku());
            }

            inventory.setAvailableQuantity(inventory.getAvailableQuantity() - item.getQuantity());
            inventory.setReservedQuantity(inventory.getReservedQuantity() + item.getQuantity());
            inventory.setLastMovementAt(LocalDateTime.now());
            inventoryRepository.save(inventory);

            String reservationCode = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Reservation reservation = Reservation.builder()
                    .reservationCode(reservationCode)
                    .orderId(orderId)
                    .sku(item.getSku())
                    .inventory(inventory)
                    .quantity(item.getQuantity())
                    .status(ReservationStatus.PENDING)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .reservedAt(LocalDateTime.now())
                    .build();

            savedReservations.add(reservationRepository.save(reservation));
        }

        log.info("Successfully reserved stock for all items of Order: {}", orderId);
        
        java.util.List<ReservationResponse> responses = savedReservations.stream()
                .map(this::mapToReservationResponse)
                .collect(java.util.stream.Collectors.toList());
                
        responses.forEach(eventPublisher::publishStockReservedEvent);
        return responses;
    }

    @Override
    @Transactional
    public void releaseReservationsForOrder(String orderId) {
        log.info("Releasing all pending reservations for Order: {}", orderId);
        java.util.List<Reservation> reservations = reservationRepository.findByOrderId(orderId);
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == com.pratham.inventory_service.enums.ReservationStatus.PENDING) {
                releaseReservation(reservation.getReservationCode());
            }
        }
    }

    @Override
    public java.util.List<com.pratham.inventory_service.dto.response.InventoryResponse> getInventoryBySku(String sku) {
        log.info("Fetching stock inventory details for SKU: {}", sku);
        return inventoryRepository.findBySku(sku).stream()
                .map(this::mapToInventoryResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private ReservationResponse mapToReservationResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .orderId(reservation.getOrderId())
                .sku(reservation.getSku())
                .warehouseId(reservation.getInventory().getWarehouse().getId())
                .quantity(reservation.getQuantity())
                .status(reservation.getStatus())
                .expiresAt(reservation.getExpiresAt())
                .build();
    }

    private com.pratham.inventory_service.dto.response.InventoryResponse mapToInventoryResponse(Inventory inventory) {
        return com.pratham.inventory_service.dto.response.InventoryResponse.builder()
                .id(inventory.getId())
                .sku(inventory.getSku())
                .warehouseId(inventory.getWarehouse().getId())
                .warehouseCode(inventory.getWarehouse().getCode())
                .availableQuantity(inventory.getAvailableQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .committedQuantity(inventory.getCommittedQuantity())
                .reorderLevel(inventory.getReorderLevel())
                .status(inventory.getStatus())
                .lastMovementAt(inventory.getLastMovementAt())
                .build();
    }
}
