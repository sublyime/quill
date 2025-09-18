package com.quill.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    private String sourceId; // Connection ID that generated this data
    
    @Column(nullable = false)
    private String dataType; // e.g., "sensor_reading", "system_status", etc.
    
    @Column(length = 4000)
    private String payload; // JSON string of the actual data
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(length = 1000)
    private String metadata; // Additional metadata as JSON
    
    @Enumerated(EnumType.STRING)
    private DataStatus status = DataStatus.ACTIVE;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "storage_config_id")
    private Long storageConfigId; // Which storage config was used
    
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
