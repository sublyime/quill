package com.quill.backend.model;

import java.time.LocalDateTime;

public class ApiError {
    private LocalDateTime timestamp;
    private String message;
    private String errorCode;
    private String path;

    public ApiError(String message, String errorCode, String path) {
        this.timestamp = LocalDateTime.now();
        this.message = message;
        this.errorCode = errorCode;
        this.path = path;
    }

    // Getters and Setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}