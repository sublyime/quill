package com.quill.backend.websocket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TerminalWebSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(TerminalWebSocketHandler.class);
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToConnection = new ConcurrentHashMap<>();

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
            // TODO: Implement actual data streaming from the connection
            // For now, just echo back the command with a prefix
            String response = "\r\n$ " + payload + "\r\n";
            session.sendMessage(new TextMessage(response));
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull org.springframework.web.socket.CloseStatus status) throws Exception {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        sessionToConnection.remove(sessionId);
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