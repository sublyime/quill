package com.quill.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "modbus_readings")
public class ModbusReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private Connection connection;

    @Column(nullable = false)
    private Integer register;

    @Column(nullable = false)
    private Integer value;

    @Column(name = "read_at", nullable = false)
    private LocalDateTime readAt;

    @Column(name = "register_type", nullable = false)
    private String registerType;

    private String quality;

    @Column(name = "error_message")
    private String errorMessage;

    public ModbusReading() {
    }

    public ModbusReading(Connection connection, int register, String registerType, int value) {
        this.connection = connection;
        this.register = register;
        this.value = value;
        this.registerType = registerType;
        this.readAt = LocalDateTime.now();
        this.quality = "GOOD";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Connection getConnection() { return connection; }
    public void setConnection(Connection connection) { this.connection = connection; }

    public Integer getRegister() { return register; }
    public void setRegister(Integer register) { this.register = register; }

    public Integer getValue() { return value; }
    public void setValue(Integer value) { this.value = value; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public String getRegisterType() { return registerType; }
    public void setRegisterType(String registerType) { this.registerType = registerType; }

    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}