package com.quill.backend.stream;

import com.quill.backend.model.Storage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstract base class for storage stream handlers providing common functionality
 */
public abstract class BaseStorageStreamHandler implements StorageStreamHandler {
    private static final Logger logger = LoggerFactory.getLogger(BaseStorageStreamHandler.class);
    protected Storage storage;
    protected boolean isActive = false;

    @Override
    public void initialize(Storage storage) {
        this.storage = storage;
        this.isActive = true;
        logger.info("Initialized storage stream handler for {} (type: {}, id: {})",
            storage.getName(), storage.getStorageType(), storage.getId());
    }

    @Override
    public void close() {
        if (isActive) {
            logger.info("Closing storage stream handler for {} (type: {}, id: {})",
                storage.getName(), storage.getStorageType(), storage.getId());
            this.isActive = false;
        }
    }

    /**
     * Send a message to the WebSocket session with proper formatting
     */
    protected void sendMessage(WebSocketSession session, String message) throws IOException {
        if (!isActive) {
            logger.warn("Attempted to send message while handler is inactive for storage {}", storage.getName());
            return;
        }
        
        // Add newlines and format with storage context
        String formattedMessage = String.format("\r\n\u001b[32m[%s] %s>\u001b[0m %s\r\n",
            storage.getStorageType(),
            storage.getName(),
            message);
            
        session.sendMessage(new TextMessage(formattedMessage));
    }

    /**
     * Send an error message to the WebSocket session
     */
    protected void sendError(WebSocketSession session, String error) throws IOException {
        if (!isActive) {
            logger.warn("Attempted to send error while handler is inactive for storage {}: {}", 
                storage.getName(), error);
            return;
        }
        logger.error("Storage error for {}: {}", storage.getName(), error);
        session.sendMessage(new TextMessage("\r\n\u001b[31mError: " + error + "\u001b[0m\r\n"));
    }
}