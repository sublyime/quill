package com.quill.backend.stream;

import com.quill.backend.model.Storage;
import org.springframework.web.socket.WebSocketSession;
import java.util.concurrent.CompletableFuture;

/**
 * Interface for handling data streaming from different storage types.
 * Each storage type (S3, Database, etc.) should implement this interface
 * to provide its specific streaming behavior.
 */
public interface StorageStreamHandler {
    
    /**
     * Initialize the stream handler with a specific storage connection
     * @param storage The storage connection configuration
     */
    void initialize(Storage storage);
    
    /**
     * Execute a command and stream the results
     * @param command The command to execute
     * @param session The WebSocket session to stream results to
     * @return A CompletableFuture that completes when streaming is finished
     */
    CompletableFuture<Void> executeCommand(String command, WebSocketSession session);
    
    /**
     * Check if this handler supports the given storage type
     * @param storageType The type of storage
     * @return true if this handler supports the storage type
     */
    boolean supportsStorageType(String storageType);
    
    /**
     * Stop streaming and cleanup any resources
     */
    void close();
}