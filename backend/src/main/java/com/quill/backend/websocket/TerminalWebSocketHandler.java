package com.quill.backend.websocket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import com.quill.backend.service.StorageService;
import com.quill.backend.model.Storage;
import com.quill.backend.stream.StorageStreamHandler;
import com.quill.backend.stream.StreamHandlerFactory;
import java.util.Optional;

public class TerminalWebSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(TerminalWebSocketHandler.class);
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToConnection = new ConcurrentHashMap<>();
    private final Map<String, StorageStreamHandler> activeHandlers = new ConcurrentHashMap<>();
    
    @Autowired
    private StorageService storageService;
    
    @Autowired
    private StreamHandlerFactory streamHandlerFactory;

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        logger.info("WebSocket connection established: {}", sessionId);
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        String payload = message.getPayload();
        
        // Handle connection selection message
        if (payload.startsWith("connect:")) {
            String connectionId = payload.substring(8).trim();
            sessionToConnection.put(session.getId(), connectionId);
            session.sendMessage(new TextMessage("\r\n\u001b[32mConnected to data source: " + connectionId + "\u001b[0m\r\n"));
            return;
        }

        // Handle data streaming for the connected data source
        String connectionId = sessionToConnection.get(session.getId());
        if (connectionId != null) {
            try {
                Long storageId = Long.parseLong(connectionId);
                Optional<Storage> storage = storageService.findById(storageId);
                
                if (storage.isPresent()) {
                    Storage connection = storage.get();
                    if (connection.getStatus() != Storage.StorageStatus.ACTIVE) {
                        session.sendMessage(new TextMessage("\r\n\u001b[31mError: Connection is not active. Current status: " + 
                            connection.getStatus() + "\u001b[0m\r\n"));
                        return;
                    }
                    
                    // Get or create stream handler for this session
                    StorageStreamHandler handler = activeHandlers.computeIfAbsent(
                        session.getId(),
                        k -> {
                            StorageStreamHandler newHandler = streamHandlerFactory.createHandler(connection.getStorageType());
                            newHandler.initialize(connection);
                            return newHandler;
                        }
                    );
                    
                    // Execute the command through the handler
                    handler.executeCommand(payload, session)
                        .exceptionally(e -> {
                            try {
                                logger.error("Error executing command", e);
                                session.sendMessage(new TextMessage("\r\n\u001b[31mError: " + e.getMessage() + "\u001b[0m\r\n"));
                            } catch (Exception ex) {
                                logger.error("Failed to send error message", ex);
                            }
                            return null;
                        });
                    
                } else {
                    session.sendMessage(new TextMessage("\r\n\u001b[31mError: Connection not found\u001b[0m\r\n"));
                }
            } catch (NumberFormatException e) {
                session.sendMessage(new TextMessage("\r\n\u001b[31mError: Invalid connection ID\u001b[0m\r\n"));
            } catch (Exception e) {
                logger.error("Error handling terminal command", e);
                session.sendMessage(new TextMessage("\r\n\u001b[31mError: " + e.getMessage() + "\u001b[0m\r\n"));
            }
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull org.springframework.web.socket.CloseStatus status) throws Exception {
        String sessionId = session.getId();
        
        // Clean up session resources
        sessions.remove(sessionId);
        sessionToConnection.remove(sessionId);
        
        // Close and remove the stream handler
        StorageStreamHandler handler = activeHandlers.remove(sessionId);
        if (handler != null) {
            handler.close();
        }
        logger.info("WebSocket connection closed: {}", sessionId);
    }

    // Method to send data to all sessions watching a specific connection
    public void broadcastToConnection(String connectionId, String data) {
        sessions.forEach((sessionId, session) -> {
            String watchingConnection = sessionToConnection.get(sessionId);
            if (connectionId.equals(watchingConnection)) {
                try {
                    session.sendMessage(new TextMessage(data));
                } catch (Exception e) {
                    logger.error("Error sending message to session: " + sessionId, e);
                }
            }
        });
    }
}