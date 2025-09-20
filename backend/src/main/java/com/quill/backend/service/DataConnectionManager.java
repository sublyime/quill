package com.quill.backend.service;

import com.quill.backend.model.Connection;
import com.quill.backend.repository.ConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DataConnectionManager {

    private final ConcurrentHashMap<Long, Thread> activeConnections = new ConcurrentHashMap<>();
    private final ConnectionRepository connectionRepository;

    @Autowired
    public DataConnectionManager(ConnectionRepository connectionRepository) {
        this.connectionRepository = connectionRepository;
    }

    public Connection startConnection(Long connectionId) {
        final Connection connection = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));

        // Check if already running
        if (activeConnections.containsKey(connectionId)) {
            throw new IllegalStateException("Connection is already running");
        }

        // Update status
        connection.setStatus(Connection.ConnectionStatus.ACTIVE);
        connectionRepository.save(connection);

        // Start connection in background thread
        Thread connectionThread = new Thread(() -> {
            try {
                runConnection(connection);
            } catch (Exception e) {
                handleConnectionError(connection, e);
            }
        });
        connectionThread.setDaemon(true);
        connectionThread.start();

        activeConnections.put(connectionId, connectionThread);
        return connection;
    }

    public Connection stopConnection(Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));

        Thread connectionThread = activeConnections.get(connectionId);
        if (connectionThread == null) {
            throw new IllegalStateException("Connection is not running");
        }

        // Interrupt and remove thread
        connectionThread.interrupt();
        activeConnections.remove(connectionId);

        // Update status
        connection.setStatus(Connection.ConnectionStatus.INACTIVE);
        return connectionRepository.save(connection);
    }

    private void runConnection(Connection connection) {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                // Implement connection-specific logic based on sourceType
                switch (connection.getSourceType().toUpperCase()) {
                    case "MQTT":
                        handleMqttConnection(connection);
                        break;
                    case "DATABASE":
                        handleDatabaseConnection(connection);
                        break;
                    case "API":
                        handleApiConnection(connection);
                        break;
                    // Add more connection types as needed
                    default:
                        throw new UnsupportedOperationException("Unsupported connection type: " + connection.getSourceType());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                handleConnectionError(connection, e);
                try {
                    Thread.sleep(5000); // Wait before retrying
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    private void handleConnectionError(Connection connection, Exception e) {
        connection.setStatus(Connection.ConnectionStatus.ERROR);
        connection.setLastError(e.getMessage());
        connectionRepository.save(connection);
    }

    private void handleMqttConnection(Connection connection) throws InterruptedException {
        // Implement MQTT connection logic
        // This is a placeholder - replace with actual MQTT client implementation
        while (!Thread.currentThread().isInterrupted()) {
            // Simulate MQTT data handling
            Thread.sleep(1000);
        }
    }

    private void handleDatabaseConnection(Connection connection) throws InterruptedException {
        // Implement database connection logic
        while (!Thread.currentThread().isInterrupted()) {
            // Simulate database data handling
            Thread.sleep(1000);
        }
    }

    private void handleApiConnection(Connection connection) throws InterruptedException {
        // Implement API connection logic
        while (!Thread.currentThread().isInterrupted()) {
            // Simulate API data handling
            Thread.sleep(1000);
        }
    }

    public boolean isConnectionRunning(Long connectionId) {
        return activeConnections.containsKey(connectionId);
    }
}