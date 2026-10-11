package com.pratham.user_service.exception;

import com.pratham.user_service.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
                        ResourceNotFoundException ex, HttpServletRequest request) {
                log.warn("ResourceNotFoundException caught: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.NOT_FOUND.value())
                                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .build();

                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
                        DuplicateResourceException ex, HttpServletRequest request) {
                log.warn("DuplicateResourceException caught: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.CONFLICT.value())
                                .error(HttpStatus.CONFLICT.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .build();

                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponse> handleBusinessException(
                        BusinessException ex, HttpServletRequest request) {
                log.warn("BusinessException caught: {}", ex.getMessage());

                // Ownership / access-denied violations should return 403 Forbidden
                boolean isAccessDenied = ex.getMessage() != null &&
                        (ex.getMessage().startsWith("Access denied") ||
                         ex.getMessage().contains("permission"));

                HttpStatus status = isAccessDenied ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST;

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(status.value())
                                .error(status.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .build();

                return new ResponseEntity<>(errorResponse, status);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
                        MethodArgumentNotValidException ex, HttpServletRequest request) {
                log.warn("MethodArgumentNotValidException caught: {}", ex.getMessage());

                List<ErrorResponse.ValidationError> validationErrors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(fieldError -> ErrorResponse.ValidationError.builder()
                                                .field(fieldError.getField())
                                                .rejectedValue(fieldError.getRejectedValue())
                                                .message(fieldError.getDefaultMessage())
                                                .build())
                                .collect(Collectors.toList());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message("Validation failed for request fields")
                                .path(request.getRequestURI())
                                .errors(validationErrors)
                                .build();

                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGlobalException(
                        Exception ex, HttpServletRequest request) {
                log.error("Unhandled exception caught: ", ex);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                                .message("An unexpected server error occurred")
                                .path(request.getRequestURI())
                                .build();

                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
