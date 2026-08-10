package com.pratham.inventory_service.service;

import com.pratham.inventory_service.dto.request.ReservationRequest;
import com.pratham.inventory_service.dto.response.InventoryResponse;
import com.pratham.inventory_service.dto.response.ReservationResponse;

import java.util.List;

public interface InventoryService {
    ReservationResponse reserveStock(ReservationRequest request);
    List<ReservationResponse> reserveStockForOrder(String orderId, List<com.pratham.inventory_service.dto.request.OrderReservationItem> items);
    void commitReservation(String reservationCode);
    void releaseReservation(String reservationCode);
    void releaseReservationsForOrder(String orderId);
    List<InventoryResponse> getInventoryBySku(String sku);
}
