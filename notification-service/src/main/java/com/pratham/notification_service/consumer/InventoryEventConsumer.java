package com.pratham.notification_service.consumer;

import com.pratham.notification_service.dto.event.EventEnvelope;
import com.pratham.notification_service.dto.event.InventoryEventPayload;
import com.pratham.notification_service.entity.ProcessedEvent;
import com.pratham.notification_service.repository.ProcessedEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.BackOff;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final ProcessedEventRepository processedEventRepository;

    private static final String CONSUMER_NAME = "notification-group";

    @RetryableTopic(attempts = "4", // 1 original attempt + 3 retries
            backOff = @BackOff(delay = 2000, multiplier = 2.0, maxDelay = 10000), // Exponential backoff: 2s, 4s, 8s
            autoCreateTopics = "true", retryTopicSuffix = ".retry", dltTopicSuffix = ".dlq", exclude = {
                    NullPointerException.class, // Code bugs are permanent, do not retry
                    IllegalArgumentException.class // Bad arguments are permanent, do not retry
            })
    @KafkaListener(topics = "ecommerce.inventory.events.v1", groupId = CONSUMER_NAME)
    @Transactional
    public void consumeStockReservedEvent(@Payload EventEnvelope<InventoryEventPayload> eventEnvelope) {
        String eventId = eventEnvelope.getEventId();
        log.info("Received Kafka Event - Type: {}, ID: {}", eventEnvelope.getEventType(), eventId);

        // Idempotency Check: Guard against duplicate delivery
        if (processedEventRepository.existsByEventIdAndConsumerName(eventId, CONSUMER_NAME)) {
            log.warn("Duplicate event detected and skipped. Event ID: {} has already been processed by consumer: {}",
                    eventId, CONSUMER_NAME);
            return;
        }

        // Simulating a temporary database outage for testing retries:
        // To test the retry, we can publish an event with SKU ending in "-FAIL"
        if (eventEnvelope.getPayload() != null && eventEnvelope.getPayload().getSku().endsWith("-FAIL")) {
            log.warn("Simulating database/network failure for SKU: {}. Triggers retry.",
                    eventEnvelope.getPayload().getSku());
            throw new RuntimeException("Temporary Database Connection Failure");
        }

        if ("STOCK_RESERVED".equals(eventEnvelope.getEventType())) {
            InventoryEventPayload payload = eventEnvelope.getPayload();

            log.info("==================================================");
            log.info("🔔 NOTIFICATION EVENT DECODED [STOCK RESERVED]");
            log.info("Reservation Code : {}", payload.getReservationCode());
            log.info("Product SKU      : {}", payload.getSku());
            log.info("Quantity         : {}", payload.getQuantity());
            log.info("Correlation ID   : {}", eventEnvelope.getCorrelationId());
            log.info("Expires At       : {}", payload.getExpiresAt());
            log.info("==================================================");

            // Record event in deduplication ledger
            ProcessedEvent processedEvent = ProcessedEvent.builder()
                    .eventId(eventId)
                    .eventType(eventEnvelope.getEventType())
                    .consumerName(CONSUMER_NAME)
                    .processedAt(LocalDateTime.now())
                    .build();
            processedEventRepository.save(processedEvent);
            log.info("Saved event ID: {} to deduplication ledger.", eventId);

        } else {
            log.warn("Unknown event type received: {}", eventEnvelope.getEventType());
        }
    }

    @DltHandler
    public void handleDltMessage(
            @Payload EventEnvelope<InventoryEventPayload> eventEnvelope,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            @Header(value = "x-exception-message", required = false) String exceptionMessage) {

        log.error("💀 POISON PILL/PERMANENT FAILURE SENT TO DLQ!");
        log.error("DLQ Topic          : {}", topic);
        log.error("Original Partition : {}", partition);
        log.error("Original Offset    : {}", offset);
        log.error("Exception Message  : {}", exceptionMessage);
        log.error("Event Details      : {}", eventEnvelope);

        // Operations teams can configure automated alerts here
    }
}
