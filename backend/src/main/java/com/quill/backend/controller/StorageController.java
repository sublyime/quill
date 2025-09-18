package com.quill.backend.controller;

import com.quill.backend.model.StorageConfig;
import com.quill.backend.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = {"http://localhost:9002", "http://localhost:3000"})
public class StorageController {
    
    @Autowired
    private StorageService storageService;
    
    // Get all storage configurations
    @GetMapping
    public ResponseEntity<List<StorageConfig>> getAllStorageConfigs() {
        try {
            System.out.println("=== GET /api/storage called ===");
            List<StorageConfig> storages = storageService.findAll();
            System.out.println("Retrieved " + storages.size() + " storage configurations");
            return ResponseEntity.ok(storages);
        } catch (Exception e) {
            System.err.println("Error retrieving storage configurations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get storage configuration by ID
    @GetMapping("/{id}")
    public ResponseEntity<StorageConfig> getStorageConfigById(@PathVariable Long id) {
        try {
            System.out.println("=== GET /api/storage/" + id + " called ===");
            return storageService.findById(id)
                .map(storage -> {
                    System.out.println("Found storage: " + storage.getName());
                    return ResponseEntity.ok(storage);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error retrieving storage by ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Create new storage configuration
    @PostMapping
    public ResponseEntity<StorageConfig> createStorageConfig(@RequestBody StorageCreateRequest request) {
        try {
            System.out.println("=== POST /api/storage called ===");
            System.out.println("Creating storage: " + request.getName());
            StorageConfig created = storageService.create(
                request.getName(),
                StorageConfig.StorageType.valueOf(request.getStorageType()),
                request.getConfiguration()
            );
            System.out.println("Storage created with ID: " + created.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.err.println("Error creating storage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Update storage configuration
    @PutMapping("/{id}")
    public ResponseEntity<StorageConfig> updateStorageConfig(
            @PathVariable Long id, 
            @RequestBody StorageCreateRequest request) {
        try {
            System.out.println("=== PUT /api/storage/" + id + " called ===");
            System.out.println("Updating storage: " + request.getName());
            StorageConfig updated = storageService.update(
                id,
                request.getName(),
                StorageConfig.StorageType.valueOf(request.getStorageType()),
                request.getConfiguration()
            );
            System.out.println("Storage updated: " + updated.getName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("Error updating storage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Delete storage configuration
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStorageConfig(@PathVariable Long id) {
        try {
            System.out.println("=== DELETE /api/storage/" + id + " called ===");
            storageService.delete(id);
            System.out.println("Storage deleted: " + id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deleting storage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Test storage connection
    @PostMapping("/{id}/test")
    public ResponseEntity<StorageConfig> testStorageConnection(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/storage/" + id + "/test called ===");
            StorageConfig tested = storageService.testConnection(id);
            System.out.println("Storage test result: " + tested.getStatus());
            return ResponseEntity.ok(tested);
        } catch (Exception e) {
            System.err.println("Error testing storage connection: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Set as default storage
    @PostMapping("/{id}/set-default")
    public ResponseEntity<StorageConfig> setAsDefault(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/storage/" + id + "/set-default called ===");
            StorageConfig defaultStorage = storageService.setAsDefault(id);
            System.out.println("Set as default storage: " + defaultStorage.getName());
            return ResponseEntity.ok(defaultStorage);
        } catch (Exception e) {
            System.err.println("Error setting default storage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Toggle active status
    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<StorageConfig> toggleActive(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/storage/" + id + "/toggle-active called ===");
            StorageConfig toggled = storageService.toggleActive(id);
            System.out.println("Toggled storage status: " + toggled.getName() + " -> " + toggled.getIsActive());
            return ResponseEntity.ok(toggled);
        } catch (Exception e) {
            System.err.println("Error toggling storage status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get storage statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStorageStats() {
        try {
            System.out.println("=== GET /api/storage/stats called ===");
            Map<String, Object> stats = storageService.getStorageStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error retrieving storage stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Request DTO
    public static class StorageCreateRequest {
        private String name;
        private String storageType;
        private Map<String, Object> configuration;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getStorageType() { return storageType; }
        public void setStorageType(String storageType) { this.storageType = storageType; }
        
        public Map<String, Object> getConfiguration() { return configuration; }
        public void setConfiguration(Map<String, Object> configuration) { this.configuration = configuration; }
    }
}
