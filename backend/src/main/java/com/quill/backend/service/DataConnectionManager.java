package com.quill.backend.service;

import com.quill.backend.model.Connection;
import com.quill.backend.model.DataRecord;
import com.quill.backend.repository.ConnectionRepository;
import com.quill.backend.service.datasource.DataSourceHandler;
import com.quill.backend.service.datasource.DataSourceHandlerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class DataConnectionManager {

    private final ConcurrentHashMap<Long, DataSourceHandler> activeHandlers = new ConcurrentHashMap<>();
    private final ConnectionRepository connectionRepository;
    private final DataSourceHandlerFactory handlerFactory;
    private final DataManagementService dataManagementService;

    @Autowired
    public DataConnectionManager(
        ConnectionRepository connectionRepository, 
        DataSourceHandlerFactory handlerFactory,
        DataManagementService dataManagementService
    ) {
        this.connectionRepository = connectionRepository;
        this.handlerFactory = handlerFactory;
        this.dataManagementService = dataManagementService;
    }

    private final Logger logger = LoggerFactory.getLogger(DataConnectionManager.class);
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    public boolean startConnection(Connection connection) {
        Long connectionId = connection.getId();
        
        // Check if already running
        if (activeHandlers.containsKey(connectionId)) {
            throw new IllegalStateException("Connection is already running");
        }

        // Get appropriate handler for this connection type
        DataSourceHandler handler = handlerFactory.getHandlerForConnection(connection)
            .orElseThrow(() -> new UnsupportedOperationException(
                "Unsupported connection type: " + connection.getSourceType()));

        try {
            // Initialize the handler
            handler.initialize(connection);
            activeHandlers.put(connectionId, handler);

            // Start data collection
            handler.startCollection().thenRun(() -> {
                // Schedule regular data collection
                scheduler.scheduleAtFixedRate(() -> {
                    try {
                        List<DataRecord> data = handler.readLatestData();
                        if (!data.isEmpty()) {
                            dataManagementService.storeDataBatch(data);
                        }
                    } catch (Exception e) {
                        logger.error("Error collecting data for connection {}: {}", 
                            connectionId, e.getMessage(), e);
                    }
                }, 0, getPollingInterval(connection), TimeUnit.MILLISECONDS);
            }).exceptionally(ex -> {
                handleConnectionError(connection, ex);
                return null;
            });

            // Update connection status
            connection.setStatus(Connection.ConnectionStatus.ACTIVE);
            connectionRepository.save(connection);
            return true;

        } catch (Exception e) {
            activeHandlers.remove(connectionId);
            handleConnectionError(connection, e);
            return false;
        }
    }

    public Connection stopConnection(Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));

        DataSourceHandler handler = activeHandlers.get(connectionId);
        if (handler == null) {
            throw new IllegalStateException("Connection is not running");
        }

        try {
            // Stop data collection
            handler.stopCollection().get(5, TimeUnit.SECONDS);
            handler.shutdown();
            activeHandlers.remove(connectionId);

            // Update connection status
            connection.setStatus(Connection.ConnectionStatus.INACTIVE);
            return connectionRepository.save(connection);
        } catch (Exception e) {
            logger.error("Error stopping connection {}: {}", connectionId, e.getMessage(), e);
            throw new RuntimeException("Failed to stop connection: " + e.getMessage(), e);
        }
    }

    private long getPollingInterval(Connection connection) {
        String intervalStr = connection.getConfigurationValue("pollInterval");
        return intervalStr != null ? Long.parseLong(intervalStr) : 1000; // Default to 1 second
    }
    private void handleConnectionError(Connection connection, Throwable e) {
        connection.setStatus(Connection.ConnectionStatus.ERROR);
        connection.setLastError(e.getMessage());
        connectionRepository.save(connection);
        logger.error("Connection error for {}: {}", connection.getId(), e.getMessage(), e);
    }

    public boolean isRunning(Long connectionId) {
        return activeHandlers.containsKey(connectionId);
    }

    public void shutdown() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(60, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }

        // Shutdown all active handlers
        activeHandlers.forEach((id, handler) -> {
            try {
                handler.shutdown();
            } catch (Exception e) {
                logger.error("Error shutting down handler for connection {}: {}", id, e.getMessage(), e);
            }
        });
        activeHandlers.clear();
    }

    /**
     * Get diagnostics for a running connection
     * @param connectionId The connection ID
     * @return List of diagnostic records, or empty list if connection is not running
     */
    public List<DataRecord> getDiagnostics(Long connectionId) {
        DataSourceHandler handler = activeHandlers.get(connectionId);
        if (handler != null) {
            return handler.getDiagnostics();
        }
        return List.of();
    }
}