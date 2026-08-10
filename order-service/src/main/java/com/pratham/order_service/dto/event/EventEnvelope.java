package com.pratham.order_service.dto.event;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class EventEnvelope<T> {
    private String eventId;
    private String eventType;
    private String eventVersion;
    private LocalDateTime occurredAt;
    private String source;
    private String correlationId;
    private T payload;
}
