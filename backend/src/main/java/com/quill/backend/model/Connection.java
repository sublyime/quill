package com.quill.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "connection")
public class Connection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String sourceType;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String config; // JSON string of connection settings

    @Enumerated(EnumType.STRING)
    private ConnectionStatus status = ConnectionStatus.OFFLINE;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime lastConnected;

    @Column
    private String lastError;

    // Constructors
    public Connection() {}

    public Connection(String name, String sourceType, String config) {
        this.name = name;
        this.sourceType = sourceType;
        this.config = config;
        this.createdAt = LocalDateTime.now();
        this.status = ConnectionStatus.OFFLINE;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public ConnectionStatus getStatus() {
        return status;
    }

    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastConnected() {
        return lastConnected;
    }

    public void setLastConnected(LocalDateTime lastConnected) {
        this.lastConnected = lastConnected;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    // Enum for connection status
    public enum ConnectionStatus {
        ONLINE, OFFLINE, ERROR, CONNECTING
    }

    // toString, equals, hashCode (optional but recommended)
    @Override
    public String toString() {
        return "Connection{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sourceType='" + sourceType + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
