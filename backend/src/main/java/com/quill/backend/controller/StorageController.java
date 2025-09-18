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
    
    @GetMapping
    public ResponseEntity<List<StorageConfig>> getAllStorageConfigs() {
        try {
            System.out.println("=== GET /api/storage called ===");
            List<StorageConfig> configs = storageService.findAll();
            System.out.println("Retrieved " + configs.size() + " storage configurations");
            return ResponseEntity.ok(configs);
        } catch (Exception e) {
            System.err.println("Error in getAllStorageConfigs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StorageConfig> getStorageConfig(@PathVariable Long id) {
        try {
            System.out.println("=== GET /api/storage/" + id + " called ===");
            return storageService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in getStorageConfig: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<StorageConfig> createStorageConfig(@RequestBody StorageConfigRequest request) {
        try {
            System.out.println("=== POST /api/storage called ===");
            System.out.println("Creating storage config: " + request.getName());
            
            StorageConfig config = storageService.create(
                request.getName(), 
                request.getStorageType(), 
                request.getConfiguration()
            );
            
            System.out.println("Successfully created storage config with ID: " + config.getId());
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            System.err.println("Error in createStorageConfig: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<StorageConfig> updateStorageConfig(@PathVariable Long id, @RequestBody StorageConfigRequest request) {
        try {
            System.out.println("=== PUT /api/storage/" + id + " called ===");
            StorageConfig config = storageService.update(
                id, 
                request.getName(), 
                request.getStorageType(), 
                request.getConfiguration()
            );
            System.out.println("Successfully updated storage config with ID: " + id);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            System.err.println("Error in updateStorageConfig: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStorageConfig(@PathVariable Long id) {
        try {
            System.out.println("=== DELETE /api/storage/" + id + " called ===");
            storageService.delete(id);
            System.out.println("Successfully deleted storage config with ID: " + id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error in deleteStorageConfig: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/test")
    public ResponseEntity<StorageConfig> testStorageConnection(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/storage/" + id + "/test called ===");
            StorageConfig config = storageService.testConnection(id);
            System.out.println("Storage connection test completed for ID: " + id);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            System.err.println("Error in testStorageConnection: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/set-default")
    public ResponseEntity<StorageConfig> setAsDefaultStorage(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/storage/" + id + "/set-default called ===");
            StorageConfig config = storageService.setAsDefault(id);
            System.out.println("Set storage config as default: " + id);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            System.err.println("Error in setAsDefaultStorage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<StorageConfig> toggleActiveStatus(@PathVariable Long id) {
        try {
            System.out.println("=== POST /api/storage/" + id + "/toggle-active called ===");
            StorageConfig config = storageService.toggleActive(id);
            System.out.println("Toggled active status for storage config: " + id);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            System.err.println("Error in toggleActiveStatus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStorageStats() {
        try {
            System.out.println("=== GET /api/storage/stats called ===");
            Map<String, Object> stats = storageService.getStorageStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error in getStorageStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Request DTO
    public static class StorageConfigRequest {
        private String name;
        private StorageConfig.StorageType storageType;
        private Map<String, Object> configuration;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public StorageConfig.StorageType getStorageType() { return storageType; }
        public void setStorageType(StorageConfig.StorageType storageType) { this.storageType = storageType; }
        
        public Map<String, Object> getConfiguration() { return configuration; }
        public void setConfiguration(Map<String, Object> configuration) { this.configuration = configuration; }
    }
}
