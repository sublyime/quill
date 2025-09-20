package com.quill.backend.exception;

public class ModbusConnectionException extends RuntimeException {
    private final String deviceAddress;
    private final int port;
    private final ErrorType errorType;

    public enum ErrorType {
        CONNECTION_FAILED,
        CONNECTION_TIMEOUT,
        INVALID_RESPONSE,
        DEVICE_BUSY,
        INVALID_DATA,
        UNSUPPORTED_FUNCTION,
        ACCESS_DENIED,
        DEVICE_FAILURE,
        CONFIGURATION_ERROR,
        SLAVE_DEVICE_FAILURE
    }

    public ModbusConnectionException(String deviceAddress, int port, ErrorType errorType, String message) {
        super(message);
        this.deviceAddress = deviceAddress;
        this.port = port;
        this.errorType = errorType;
    }

    public ModbusConnectionException(String deviceAddress, int port, ErrorType errorType, String message, Throwable cause) {
        super(message, cause);
        this.deviceAddress = deviceAddress;
        this.port = port;
        this.errorType = errorType;
    }

    public String getDeviceAddress() {
        return deviceAddress;
    }

    public int getPort() {
        return port;
    }

    public ErrorType getErrorType() {
        return errorType;
    }

    @Override
    public String toString() {
        return String.format("ModbusConnectionException{deviceAddress='%s', port=%d, errorType=%s, message='%s'}",
                deviceAddress, port, errorType, getMessage());
    }
}