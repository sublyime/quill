package com.quill.backend.controller;

import com.quill.backend.model.Connection;
import com.quill.backend.repository.ConnectionRepository;
import com.quill.backend.service.DataConnectionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/connections")
@CrossOrigin(origins = {"http://localhost:9002", "http://localhost:3000"})
public class ConnectionController {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private DataConnectionManager dataConnectionManager;

    @GetMapping
    public ResponseEntity<List<Connection>> getAllConnections() {
        try {
            System.out.println("=== GET /api/connections called ===");
            List<Connection> connections = connectionRepository.findAll();
            System.out.println("Successfully retrieved " + connections.size() + " connections");
            return ResponseEntity.ok(connections);
        } catch (Exception e) {
            System.err.println("=== ERROR in getAllConnections ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createConnection(@RequestBody Connection connection) {
        try {
            System.out.println("=== POST /api/connections called ===");
            
            // Validate required fields
            if (connection.getName() == null || connection.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Connection name is required");
            }
            if (connection.getSourceType() == null || connection.getSourceType().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Source type is required");
            }
            
            // Set the type to match the sourceType for now
            connection.setType(connection.getSourceType());
            
            System.out.println("Received connection: " + connection.getName());
            Connection saved = connectionRepository.save(connection);
            System.out.println("Successfully saved connection with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("=== ERROR in createConnection ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create connection: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Connection> getConnection(@PathVariable Long id) {
        try {
            System.out.println("=== GET /api/connections/" + id + " called ===");
            Optional<Connection> connection = connectionRepository.findById(id);
            if (connection.isPresent()) {
                return ResponseEntity.ok(connection.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== ERROR in getConnection ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<String> testConnection(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/connections/" + id + "/test called ===");
            Optional<Connection> connectionOpt = connectionRepository.findById(id);
            
            if (connectionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Connection connection = connectionOpt.get();
            
            // Simulate connection test
            boolean success = Math.random() > 0.3; // 70% success rate
            
            if (success) {
                connection.setStatus(Connection.ConnectionStatus.ONLINE);
                connection.setLastConnected(java.time.LocalDateTime.now());
                connection.setLastError(null);
                connectionRepository.save(connection);
                return ResponseEntity.ok("Connection test successful");
            } else {
                connection.setStatus(Connection.ConnectionStatus.ERROR);
                connection.setLastError("Connection test failed");
                connectionRepository.save(connection);
                return ResponseEntity.ok("Connection test failed");
            }
            
        } catch (Exception e) {
            System.err.println("=== ERROR in testConnection ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnection(@PathVariable Long id) {
        try {
            System.out.println("=== DELETE /api/connections/" + id + " called ===");
            if (connectionRepository.existsById(id)) {
                if (dataConnectionManager.isConnectionRunning(id)) {
                    dataConnectionManager.stopConnection(id);
                }
                connectionRepository.deleteById(id);
                System.out.println("Successfully deleted connection with ID: " + id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== ERROR in deleteConnection ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startConnection(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/connections/" + id + "/start called ===");
            Connection connection = dataConnectionManager.startConnection(id);
            return ResponseEntity.ok(connection);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("=== ERROR in startConnection ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<?> stopConnection(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/connections/" + id + "/stop called ===");
            Connection connection = dataConnectionManager.stopConnection(id);
            return ResponseEntity.ok(connection);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("=== ERROR in stopConnection ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getConnectionStatus(@PathVariable Long id) {
        try {
            System.out.println("=== GET /api/connections/" + id + "/status called ===");
            Optional<Connection> connection = connectionRepository.findById(id);
            if (connection.isPresent()) {
                boolean isRunning = dataConnectionManager.isConnectionRunning(id);
                return ResponseEntity.ok(Map.of(
                    "status", connection.get().getStatus(),
                    "isRunning", isRunning,
                    "lastError", connection.get().getLastError()
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== ERROR in getConnectionStatus ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
