package com.quill.backend.service.datasource;

import com.quill.backend.model.Connection;
import com.quill.backend.model.DataRecord;
import com.quill.backend.service.ModbusConnectionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class ModbusDataSourceHandler implements DataSourceHandler {

    private final ModbusConnectionManager modbusManager;
    private Connection connection;
    private final AtomicBoolean isCollecting;
    
    @Autowired
    public ModbusDataSourceHandler(ModbusConnectionManager modbusManager) {
        this.modbusManager = modbusManager;
        this.isCollecting = new AtomicBoolean(false);
    }

    @Override
    public void initialize(Connection connection) throws Exception {
        this.connection = connection;
    }

    @Override
    public CompletableFuture<Void> startCollection() {
        return CompletableFuture.runAsync(() -> {
            try {
                if (!isCollecting.get()) {
                    modbusManager.startConnection(connection);
                    isCollecting.set(true);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to start Modbus data collection", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> stopCollection() {
        return CompletableFuture.runAsync(() -> {
            if (isCollecting.get()) {
                modbusManager.stopConnection(connection);
                isCollecting.set(false);
            }
        });
    }

    @Override
    public boolean isCollecting() {
        return isCollecting.get();
    }

    @Override
    public List<DataRecord> readLatestData() throws Exception {
        // The actual data collection is handled by ModbusConnectionManager
        // This method is mainly used for on-demand reading
        return new ArrayList<>();
    }

    @Override
    public boolean writeData(String address, Object value) throws Exception {
        if (!(value instanceof Number)) {
            throw new IllegalArgumentException("Value must be a number for Modbus writes");
        }
        
        int register = Integer.parseInt(address);
        int numericValue = ((Number) value).intValue();

        switch (connection.getConfigurationValue("registerType").toLowerCase()) {
            case "holding":
                modbusManager.writeHoldingRegister(connection, register, numericValue);
                return true;
            case "coil":
                modbusManager.writeCoil(connection, register, numericValue != 0);
                return true;
            default:
                throw new IllegalArgumentException("Cannot write to register type: " + 
                    connection.getConfigurationValue("registerType"));
        }
    }

    @Override
    public List<DataRecord> getDiagnostics() {
        List<DataRecord> diagnostics = new ArrayList<>();
        
        // Add connection status diagnostic
        DataRecord connectionStatus = new DataRecord();
        connectionStatus.setSourceId(connection.getId().toString());
        connectionStatus.setDataType("diagnostic");
        connectionStatus.setTimestamp(LocalDateTime.now());
        connectionStatus.setContent(String.format(
            "{\"type\":\"connection_status\",\"value\":\"%s\",\"address\":\"%s\",\"port\":\"%s\"}",
            isCollecting.get() ? "CONNECTED" : "DISCONNECTED",
            connection.getConfigurationValue("ipAddress"),
            connection.getConfigurationValue("port")
        ));
        diagnostics.add(connectionStatus);

        return diagnostics;
    }

    @Override
    public void shutdown() {
        if (isCollecting.get()) {
            modbusManager.stopConnection(connection);
            isCollecting.set(false);
        }
    }

    @Override
    public String getSourceType() {
        return "modbus_tcp";
    }

    @Override
    public boolean testConnection() throws Exception {
        try {
            // Use start/stop to test the connection
            modbusManager.startConnection(connection);
            modbusManager.stopConnection(connection);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}