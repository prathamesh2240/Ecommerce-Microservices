package com.pratham.order_service.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean success;
    private LocalDateTime timestamp;
    private String message;
    private T data;
}
