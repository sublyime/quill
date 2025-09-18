package com.quill.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
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

    public enum ConnectionStatus {
        ONLINE, OFFLINE, ERROR, CONNECTING
    }
}
