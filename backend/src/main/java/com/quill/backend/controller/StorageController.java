package com.quill.backend.controller;

import com.quill.backend.model.Storage;
import com.quill.backend.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*")
public class StorageController {
    
    @Autowired
    private StorageService storageService;
    
    @GetMapping
    public List<Storage> getAllStorage() {
        return storageService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Storage> getStorageById(@PathVariable Long id) {
        return storageService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Storage> createStorage(@RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            String storageType = (String) request.get("storageType");
            Object configuration = request.get("configuration");
            
            String configJson = "";
            if (configuration != null) {
                configJson = configuration.toString();
            }
            
            Storage storage = storageService.create(name, storageType, configJson);
            return ResponseEntity.ok(storage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/test")
    public ResponseEntity<Storage> testConnection(@PathVariable Long id) {
        try {
            Storage storage = storageService.testConnection(id);
            return ResponseEntity.ok(storage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/set-default")
    public ResponseEntity<Storage> setAsDefault(@PathVariable Long id) {
        try {
            Storage storage = storageService.setAsDefault(id);
            return ResponseEntity.ok(storage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStorage(@PathVariable Long id) {
        try {
            storageService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
