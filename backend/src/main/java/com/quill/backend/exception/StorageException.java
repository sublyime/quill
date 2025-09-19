package com.quill.backend.exception;

public class StorageException extends RuntimeException {
    private final String errorCode;

    public StorageException(String message) {
        super(message);
        this.errorCode = "STORAGE_ERROR";
    }

    public StorageException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}