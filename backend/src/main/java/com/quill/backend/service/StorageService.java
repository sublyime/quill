package com.quill.backend.service;

import com.quill.backend.model.Storage;
import com.quill.backend.repository.StorageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StorageService {
    
    @Autowired
    private StorageRepository storageRepository;
    
    public List<Storage> findAll() {
        return storageRepository.findAll();
    }
    
    public Optional<Storage> findById(Long id) {
        return storageRepository.findById(id);
    }
    
    public Storage save(Storage storage) {
        storage.setUpdatedAt(LocalDateTime.now());
        return storageRepository.save(storage);
    }
    
    public Storage create(String name, String storageType, String configuration) {
        Storage storage = new Storage();
        storage.setName(name);
        storage.setStorageType(storageType);
        storage.setConfiguration(configuration);
        storage.setStatus(Storage.StorageStatus.CONFIGURED);
        storage.setIsActive(true);
        storage.setCreatedAt(LocalDateTime.now());
        storage.setUpdatedAt(LocalDateTime.now());
        
        return storageRepository.save(storage);
    }
    
    // ADD THIS METHOD - Find default storage configuration
    public Optional<Storage> findDefaultStorage() {
        return storageRepository.findByIsDefaultTrue();
    }
    
    public Storage testConnection(Long id) {
        Storage storage = findById(id).orElseThrow(() -> new RuntimeException("Storage not found"));
        
        storage.setStatus(Storage.StorageStatus.TESTING);
        storage.setLastTestedAt(LocalDateTime.now());
        storageRepository.save(storage);
        
        // Simulate connection test
        try {
            Thread.sleep(1000); // Simulate test time
            storage.setStatus(Storage.StorageStatus.ACTIVE);
            storage.setLastTestResult("Connection successful");
        } catch (Exception e) {
            storage.setStatus(Storage.StorageStatus.ERROR);
            storage.setLastTestResult("Connection failed: " + e.getMessage());
        }
        
        return storageRepository.save(storage);
    }
    
    public Storage setAsDefault(Long id) {
        // Remove default from all others
        List<Storage> allStorage = storageRepository.findAll();
        allStorage.forEach(s -> s.setIsDefault(false));
        storageRepository.saveAll(allStorage);
        
        // Set new default
        Storage storage = findById(id).orElseThrow(() -> new RuntimeException("Storage not found"));
        storage.setIsDefault(true);
        return storageRepository.save(storage);
    }
    
    public void delete(Long id) {
        Storage storage = findById(id).orElseThrow(() -> new RuntimeException("Storage not found"));
        storageRepository.delete(storage);
    }
    
    // Additional helper methods
    public boolean existsByName(String name) {
        return storageRepository.existsByName(name);
    }
    
    public List<Storage> findActiveStorage() {
        return storageRepository.findAll().stream()
                .filter(Storage::getIsActive)
                .toList();
    }
    
    public long getStorageCount() {
        return storageRepository.count();
    }
    
    public Storage getDefaultStorageOrThrow() {
        return findDefaultStorage()
                .orElseThrow(() -> new RuntimeException("No default storage configuration found"));
    }
    
    public Storage createDefaultIfNone() {
        Optional<Storage> defaultStorage = findDefaultStorage();
        if (defaultStorage.isEmpty()) {
            // Create a default local file system storage
            Storage storage = new Storage();
            storage.setName("Default Local Storage");
            storage.setStorageType("LOCAL_FILE_SYSTEM");
            storage.setConfiguration("{\"path\":\"/var/lib/quill/data\",\"maxFileSize\":100}");
            storage.setIsDefault(true);
            storage.setIsActive(true);
            storage.setStatus(Storage.StorageStatus.CONFIGURED);
            storage.setCreatedAt(LocalDateTime.now());
            storage.setUpdatedAt(LocalDateTime.now());
            
            return storageRepository.save(storage);
        }
        return defaultStorage.get();
    }
}
