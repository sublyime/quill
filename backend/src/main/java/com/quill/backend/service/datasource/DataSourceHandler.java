package com.quill.backend.service.datasource;

import com.quill.backend.model.Connection;
import com.quill.backend.model.DataRecord;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Common interface for all data source handlers.
 * Provides standardized methods for connection management and data collection.
 */
public interface DataSourceHandler {
    /**
     * Initialize the handler for a specific connection
     * @param connection The connection configuration
     * @throws Exception if initialization fails
     */
    void initialize(Connection connection) throws Exception;

    /**
     * Start data collection for this source
     * @return A CompletableFuture that completes when collection is started
     */
    CompletableFuture<Void> startCollection();

    /**
     * Stop data collection for this source
     * @return A CompletableFuture that completes when collection is stopped
     */
    CompletableFuture<Void> stopCollection();

    /**
     * Get the current connection status
     * @return true if the connection is active and collecting data
     */
    boolean isCollecting();

    /**
     * Read the latest data from the source
     * @return List of DataRecord objects containing the collected data
     * @throws Exception if data collection fails
     */
    List<DataRecord> readLatestData() throws Exception;

    /**
     * Write data to the source (if supported)
     * @param address The address or identifier for the data point
     * @param value The value to write
     * @return true if write was successful
     * @throws Exception if write operation fails or is not supported
     */
    boolean writeData(String address, Object value) throws Exception;

    /**
     * Get diagnostic information about the connection
     * @return Diagnostic information as key-value pairs
     */
    default List<DataRecord> getDiagnostics() {
        return List.of();
    }

    /**
     * Clean up resources when the handler is no longer needed
     */
    void shutdown();

    /**
     * Get the type of data source this handler manages
     * @return The source type identifier (e.g., "modbus_tcp", "mqtt", etc.)
     */
    String getSourceType();

    /**
     * Test the connection without starting data collection
     * @return true if connection test is successful
     * @throws Exception if test fails
     */
    boolean testConnection() throws Exception;
}