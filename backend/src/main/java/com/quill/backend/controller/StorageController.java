package com.quill.backend.controller;

import com.quill.backend.dto.StorageCreateRequest;
import com.quill.backend.model.ApiResponse;
import com.quill.backend.model.Storage;
import com.quill.backend.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*")
public class StorageController {
    
    @Autowired
    private StorageService storageService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Storage>>> getAllStorage() {
        List<Storage> storages = storageService.findAll();
        return ResponseEntity.ok(ApiResponse.success(storages, "Retrieved all storage configurations"));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Storage>> getStorageById(@PathVariable Long id) {
        return storageService.findById(id)
                .map(storage -> ResponseEntity.ok(ApiResponse.success(storage, "Storage configuration retrieved successfully")))
                .orElse(ResponseEntity.ok(ApiResponse.error("Storage configuration not found")));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Storage>> createStorage(@Valid @RequestBody StorageCreateRequest request) {
        Storage storage = storageService.create(
            request.getName(),
            request.getStorageType(),
            request.getConfiguration()
        );
        return ResponseEntity.ok(ApiResponse.success(storage, "Storage configuration created successfully"));
    }
    
    @PostMapping("/{id}/test")
    public ResponseEntity<ApiResponse<Storage>> testConnection(@PathVariable Long id) {
        Storage storage = storageService.testConnection(id);
        return ResponseEntity.ok(ApiResponse.success(storage, "Connection test completed successfully"));
    }
    
    @PostMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<Storage>> setAsDefault(@PathVariable Long id) {
        Storage storage = storageService.setAsDefault(id);
        return ResponseEntity.ok(ApiResponse.success(storage, "Default storage configuration updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStorage(@PathVariable Long id) {
        storageService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Storage configuration deleted successfully"));
    }
}
