package com.quill.backend.service.datasource;

import com.quill.backend.model.Connection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DataSourceHandlerFactory {
    
    private final Map<String, DataSourceHandler> handlers = new HashMap<>();
    
    @Autowired
    public DataSourceHandlerFactory(
        ModbusDataSourceHandler modbusHandler,
        MqttDataSourceHandler mqttHandler
    ) {
        handlers.put(modbusHandler.getSourceType(), modbusHandler);
        handlers.put(mqttHandler.getSourceType(), mqttHandler);
    }
    
    /**
     * Get a handler for the given connection type
     * @param sourceType The type of data source (e.g., "modbus_tcp", "mqtt")
     * @return Optional containing the handler if available
     */
    public Optional<DataSourceHandler> getHandler(String sourceType) {
        return Optional.ofNullable(handlers.get(sourceType));
    }
    
    /**
     * Get a handler for the given connection
     * @param connection The connection configuration
     * @return Optional containing the handler if available
     */
    public Optional<DataSourceHandler> getHandlerForConnection(Connection connection) {
        return getHandler(connection.getSourceType());
    }
    
    /**
     * Get all registered handlers
     * @return List of all available handlers
     */
    public List<DataSourceHandler> getAllHandlers() {
        return List.copyOf(handlers.values());
    }
    
    /**
     * Check if a handler is available for the given source type
     * @param sourceType The type of data source
     * @return true if a handler is available
     */
    public boolean hasHandlerForType(String sourceType) {
        return handlers.containsKey(sourceType);
    }
}