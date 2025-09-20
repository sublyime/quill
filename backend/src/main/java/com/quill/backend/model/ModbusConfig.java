package com.quill.backend.model;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ModbusConfig {
    @NotNull(message = "IP address is required")
    @Pattern(regexp = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
            message = "Invalid IP address format")
    private String ipAddress;

    @NotNull(message = "Port is required")
    @Min(value = 1, message = "Port must be greater than 0")
    @Max(value = 65535, message = "Port must be less than 65536")
    private Integer port;

    @NotNull(message = "Slave ID is required")
    @Min(value = 1, message = "Slave ID must be greater than 0")
    @Max(value = 255, message = "Slave ID must be less than 256")
    private Integer slaveId;

    @NotNull(message = "Register type is required")
    @Pattern(regexp = "^(holding|input|coil|discrete)$",
            message = "Register type must be one of: holding, input, coil, discrete")
    private String registerType;

    @NotNull(message = "Start address is required")
    @Min(value = 0, message = "Start address must be non-negative")
    private Integer startAddress;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than 0")
    @Max(value = 125, message = "Quantity must be less than 126 for registers")
    private Integer quantity;

    @Min(value = 0, message = "Poll interval must be non-negative")
    private Integer pollInterval = 1000; // Default 1 second

    @Min(value = 0, message = "Connection timeout must be non-negative")
    private Integer connectionTimeout = 3000; // Default 3 seconds

    @Min(value = 0, message = "Maximum retries must be non-negative")
    private Integer maxRetries = 3;

    public ModbusConfig() {
    }

    // Getters and Setters
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }

    public Integer getSlaveId() { return slaveId; }
    public void setSlaveId(Integer slaveId) { this.slaveId = slaveId; }

    public String getRegisterType() { return registerType; }
    public void setRegisterType(String registerType) { this.registerType = registerType; }

    public Integer getStartAddress() { return startAddress; }
    public void setStartAddress(Integer startAddress) { this.startAddress = startAddress; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPollInterval() { return pollInterval; }
    public void setPollInterval(Integer pollInterval) { this.pollInterval = pollInterval; }

    public Integer getConnectionTimeout() { return connectionTimeout; }
    public void setConnectionTimeout(Integer connectionTimeout) { this.connectionTimeout = connectionTimeout; }

    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }

    @Override
    public String toString() {
        return "ModbusConfig{" +
                "ipAddress='" + ipAddress + '\'' +
                ", port=" + port +
                ", slaveId=" + slaveId +
                ", registerType='" + registerType + '\'' +
                ", startAddress=" + startAddress +
                ", quantity=" + quantity +
                ", pollInterval=" + pollInterval +
                ", connectionTimeout=" + connectionTimeout +
                ", maxRetries=" + maxRetries +
                '}';
    }
}