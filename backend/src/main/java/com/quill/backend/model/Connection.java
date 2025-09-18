package com.quill.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Table(name = "connections")
public class Connection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sourceType;
    
    @Column(columnDefinition = "TEXT")
    private String config;
    
    @Enumerated(EnumType.STRING)
    private ConnectionStatus status = ConnectionStatus.OFFLINE;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastConnected;
    
    private String lastError;

    // Default constructor
    public Connection() {
        this.createdAt = LocalDateTime.now();
        this.status = ConnectionStatus.OFFLINE;
    }

    // Getters and Setters - CRITICAL!
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    
    public String getConfig() { return config; }
    public void setConfig(String config) { this.config = config; }
    
    public ConnectionStatus getStatus() { return status; }
    public void setStatus(ConnectionStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getLastConnected() { return lastConnected; }
    public void setLastConnected(LocalDateTime lastConnected) { this.lastConnected = lastConnected; }
    
    public String getLastError() { return lastError; }
    public void setLastError(String lastError) { this.lastError = lastError; }

    public enum ConnectionStatus {
        ONLINE, OFFLINE, ERROR, CONNECTING
    }
}
