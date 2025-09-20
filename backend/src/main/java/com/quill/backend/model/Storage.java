package com.quill.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Table(name = "storage_configs")
public class Storage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String storageType;
    
    @Column(length = 5000)
    private String configuration;
    
    @Enumerated(EnumType.STRING)
    private StorageStatus status = StorageStatus.CONFIGURED;
    
    private Boolean isDefault = false;
    private Boolean isActive = true;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastTestedAt;
    
    private String lastTestResult;
    
    // Constructors
    public Storage() {}
    
    public Storage(String name, String storageType, String configuration) {
        this.name = name;
        this.storageType = storageType;
        this.configuration = configuration;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getStorageType() { return storageType; }
    public void setStorageType(String storageType) { this.storageType = storageType; }
    
    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }
    
    public StorageStatus getStatus() { return status; }
    public void setStatus(StorageStatus status) { this.status = status; }
    
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getLastTestedAt() { return lastTestedAt; }
    public void setLastTestedAt(LocalDateTime lastTestedAt) { this.lastTestedAt = lastTestedAt; }
    
    public String getLastTestResult() { return lastTestResult; }
    public void setLastTestResult(String lastTestResult) { this.lastTestResult = lastTestResult; }
    
    // Enum for storage status
    public enum StorageStatus {
        CONFIGURED, ACTIVE, INACTIVE, ERROR, TESTING
    }
    
    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Transient field to hold parsed configuration
    @Transient
    private com.fasterxml.jackson.databind.JsonNode configurationJson;

    /**
     * Get a configuration value by key
     * @param key The configuration key
     * @return The value if found, null otherwise
     */
    public String getConfigurationValue(String key) {
        try {
            if (configurationJson == null && configuration != null) {
                configurationJson = new com.fasterxml.jackson.databind.ObjectMapper().readTree(configuration);
            }
            return configurationJson != null && configurationJson.has(key) ? 
                   configurationJson.get(key).asText() : null;
        } catch (Exception e) {
            throw new RuntimeException("Error parsing configuration: " + e.getMessage(), e);
        }
    }
}
