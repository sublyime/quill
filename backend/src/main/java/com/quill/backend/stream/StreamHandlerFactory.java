package com.quill.backend.stream;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.ArrayList;

@Component
public class StreamHandlerFactory {
    private final List<StorageStreamHandler> handlers;
    
    public StreamHandlerFactory() {
        handlers = new ArrayList<>();
        // Register handlers
        handlers.add(new S3StreamHandler());
        handlers.add(new DatabaseStreamHandler());
        handlers.add(new FileSystemStreamHandler());
    }
    
    /**
     * Create a stream handler for the given storage type
     * @param storageType The type of storage (e.g., "S3", "Database")
     * @return A new instance of the appropriate handler
     * @throws IllegalArgumentException if no handler supports the storage type
     */
    public StorageStreamHandler createHandler(String storageType) {
        return handlers.stream()
            .filter(handler -> handler.supportsStorageType(storageType))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("No handler found for storage type: " + storageType));
    }
}