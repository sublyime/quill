package com.quill.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_records", indexes = {
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_source_timestamp", columnList = "sourceId, timestamp"),
    @Index(name = "idx_data_type", columnList = "dataType")
})
public class DataRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String sourceId;
    
    @Column(nullable = false)
    private String dataType;
    
    @Column(length = 4000)
    private String payload;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(length = 1000)
    private String metadata;
    
    @Enumerated(EnumType.STRING)
    private DataStatus status = DataStatus.ACTIVE;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "storage_config_id")
    private Long storageConfigId;
    
    // Constructors
    public DataRecord() {}
    
    public DataRecord(String sourceId, String dataType, String payload) {
        this.sourceId = sourceId;
        this.dataType = dataType;
        this.payload = payload;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    
    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }
    
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    
    public DataStatus getStatus() { return status; }
    public void setStatus(DataStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Long getStorageConfigId() { return storageConfigId; }
    public void setStorageConfigId(Long storageConfigId) { this.storageConfigId = storageConfigId; }
    
    // Data Status Enum
    public enum DataStatus {
        ACTIVE, ARCHIVED, DELETED, ERROR
    }
    
    @PrePersist
    void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
