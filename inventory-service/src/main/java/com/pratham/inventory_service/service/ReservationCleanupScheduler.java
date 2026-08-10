package com.pratham.inventory_service.service;

import com.pratham.inventory_service.entity.Reservation;
import com.pratham.inventory_service.enums.ReservationStatus;
import com.pratham.inventory_service.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationCleanupScheduler {

    private final ReservationRepository reservationRepository;
    private final InventoryService inventoryService;

    /**
     * Runs every 60 seconds.
     * Finds expired reservations and automatically releases reserved stock.
     */
    @Scheduled(fixedDelay = 60000)
    public void releaseExpiredReservations() {

        log.debug("Scanning for expired reservations...");

        List<Reservation> expiredReservations = reservationRepository.findExpiredReservations(
                ReservationStatus.PENDING,
                LocalDateTime.now());

        if (expiredReservations.isEmpty()) {
            log.debug("No expired reservations found.");
            return;
        }

        log.info("Found {} expired reservations.", expiredReservations.size());

        for (Reservation reservation : expiredReservations) {

            try {

                inventoryService.releaseReservation(
                        reservation.getReservationCode());

                log.info(
                        "Reservation {} released successfully.",
                        reservation.getReservationCode());

            } catch (Exception ex) {

                log.error(
                        "Failed to release reservation {}. Reason: {}",
                        reservation.getReservationCode(),
                        ex.getMessage(),
                        ex);

            }
        }
    }
}