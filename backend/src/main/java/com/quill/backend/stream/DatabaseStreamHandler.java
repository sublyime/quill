package com.quill.backend.stream;

import org.springframework.web.socket.WebSocketSession;
import java.util.concurrent.CompletableFuture;
import java.sql.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.quill.backend.model.Storage;

public class DatabaseStreamHandler extends BaseStorageStreamHandler {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseStreamHandler.class);
    private Connection connection;
    private ObjectMapper objectMapper = new ObjectMapper();
    private static final int MAX_RESULTS = 1000; // Limit for safety

    @Override
    public void initialize(Storage storage) {
        super.initialize(storage);
        try {
            DbConfig config = objectMapper.readValue(storage.getConfiguration(), DbConfig.class);
            connection = DriverManager.getConnection(
                config.getUrl(),
                config.getUsername(),
                config.getPassword()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize database connection: " + e.getMessage(), e);
        }
    }

    @Override
    public CompletableFuture<Void> executeCommand(String command, WebSocketSession session) {
        return CompletableFuture.runAsync(() -> {
            try {
                String cmd = command.trim().toLowerCase();
                if (cmd.equals("help")) {
                    showHelp(session);
                    return;
                }
                
                if (cmd.equals("tables")) {
                    listTables(session);
                    return;
                }
                
                // Execute SQL query
                if (cmd.startsWith("select") || cmd.startsWith("show")) {
                    executeQuery(command, session);
                } else {
                    executeUpdate(command, session);
                }
            } catch (Exception e) {
                try {
                    sendError(session, "SQL Error: " + e.getMessage());
                } catch (Exception ex) {
                    logger.error("Failed to send error message", ex);
                }
            }
        });
    }

    private void executeQuery(String sql, WebSocketSession session) throws Exception {
        try (Statement stmt = connection.createStatement()) {
            // Set fetch size for efficiency
            stmt.setFetchSize(100);
            
            ResultSet rs = stmt.executeQuery(sql);
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            
            // Build column headers
            StringBuilder result = new StringBuilder();
            for (int i = 1; i <= columnCount; i++) {
                if (i > 1) result.append(" | ");
                result.append(metaData.getColumnName(i));
            }
            result.append("\n");
            
            // Add separator line
            result.append("-".repeat(result.length())).append("\n");
            
            // Stream results
            int rowCount = 0;
            while (rs.next() && rowCount < MAX_RESULTS) {
                for (int i = 1; i <= columnCount; i++) {
                    if (i > 1) result.append(" | ");
                    String value = rs.getString(i);
                    result.append(value != null ? value : "NULL");
                }
                result.append("\n");
                rowCount++;
                
                // Send in chunks to avoid memory issues
                if (rowCount % 100 == 0) {
                    sendMessage(session, result.toString());
                    result.setLength(0);
                }
            }
            
            // Send remaining results
            if (result.length() > 0) {
                sendMessage(session, result.toString());
            }
            
            // Show truncation message if needed
            if (rowCount >= MAX_RESULTS) {
                sendMessage(session, "\nResults truncated. Showing first " + MAX_RESULTS + " rows.");
            }
        }
    }

    private void executeUpdate(String sql, WebSocketSession session) throws Exception {
        try (Statement stmt = connection.createStatement()) {
            int affected = stmt.executeUpdate(sql);
            sendMessage(session, affected + " row(s) affected.");
        }
    }

    private void listTables(WebSocketSession session) throws Exception {
        try (ResultSet rs = connection.getMetaData().getTables(null, null, "%", new String[]{"TABLE"})) {
            StringBuilder result = new StringBuilder("Available tables:\n");
            while (rs.next()) {
                result.append("- ").append(rs.getString("TABLE_NAME")).append("\n");
            }
            sendMessage(session, result.toString());
        }
    }

    private void showHelp(WebSocketSession session) throws Exception {
        String helpText = """
            Available commands:
            help                  Show this help message
            tables               List available tables
            select ...           Execute SELECT query
            insert/update/delete Execute DML statements
            show ...            Execute SHOW commands
            
            Examples:
            select * from users limit 10
            select count(*) from orders
            show tables
            """;
        sendMessage(session, helpText);
    }

    @Override
    public boolean supportsStorageType(String storageType) {
        return "DATABASE".equalsIgnoreCase(storageType);
    }

    @Override
    public void close() {
        super.close();
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (Exception e) {
            logger.error("Error closing database connection", e);
        }
    }

    private static class DbConfig {
        @JsonProperty
        private String url;
        @JsonProperty
        private String username;
        @JsonProperty
        private String password;
        
        public String getUrl() { return url; }
        public String getUsername() { return username; }
        public String getPassword() { return password; }
    }
}