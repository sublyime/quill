package com.quill.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "storage_configs")
public class StorageConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StorageType storageType;
    
    @Column(length = 2000)
    private String configuration; // JSON string of config parameters
    
    @Enumerated(EnumType.STRING)
    private StorageStatus status = StorageStatus.INACTIVE;
    
    private Boolean isActive = false;
    private Boolean isDefault = false;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastTestedAt;
    
    private String lastTestResult;
    private String lastError;
    
    // Storage Type Enum
    public enum StorageType {
        POSTGRESQL, MSSQL, AWS_S3, GOOGLE_CLOUD_STORAGE, 
        AZURE_BLOB_STORAGE, ORACLE_CLOUD, LOCAL_FILE_SYSTEM
    }
    
    // Storage Status Enum
    public enum StorageStatus {
        ACTIVE, INACTIVE, ERROR, TESTING, CONFIGURED
    }
    
    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
