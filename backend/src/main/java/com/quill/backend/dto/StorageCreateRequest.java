package com.quill.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StorageCreateRequest {
    @NotBlank(message = "Storage name is required")
    @Size(min = 3, max = 50, message = "Storage name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Storage type is required")
    private String storageType;

    private String configuration;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStorageType() {
        return storageType;
    }

    public void setStorageType(String storageType) {
        this.storageType = storageType;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }
}