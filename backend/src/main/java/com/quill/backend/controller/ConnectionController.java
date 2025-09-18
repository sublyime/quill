package com.quill.backend.controller;

import com.quill.backend.model.Connection;
import com.quill.backend.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/connections")
@CrossOrigin(origins = "*")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    @GetMapping
    public List<Connection> getAllConnections() {
        return connectionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Connection> getConnectionById(@PathVariable Long id) {
        Optional<Connection> connection = connectionService.findById(id);
        return connection.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Connection> createConnection(@RequestBody Connection connection) {
        try {
            Connection savedConnection = connectionService.save(connection);
            return ResponseEntity.ok(savedConnection);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Connection> updateConnection(@PathVariable Long id, @RequestBody Connection connection) {
        connection.setId(id);
        try {
            Connection updatedConnection = connectionService.save(connection);
            return ResponseEntity.ok(updatedConnection);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnection(@PathVariable Long id) {
        connectionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<String> testConnection(@PathVariable Long id) {
        try {
            boolean isConnected = connectionService.testConnection(id);
            return ResponseEntity.ok(isConnected ? "Connection successful" : "Connection failed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error testing connection: " + e.getMessage());
        }
    }
}
