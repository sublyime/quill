package com.quill.backend.stream;

import com.quill.backend.model.Storage;
import org.springframework.web.socket.WebSocketSession;
import java.util.concurrent.CompletableFuture;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.regions.Region;
import com.fasterxml.jackson.annotation.JsonProperty;

public class S3StreamHandler extends BaseStorageStreamHandler {
    private S3Client s3Client;
    private String bucket;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void initialize(Storage storage) {
        super.initialize(storage);
        try {
            // Parse configuration
            S3Config config = objectMapper.readValue(storage.getConfiguration(), S3Config.class);
            this.bucket = config.getBucket();
            
            // Initialize S3 client
            this.s3Client = S3Client.builder()
                .region(Region.of(config.getRegion()))
                .build();
                
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize S3 stream handler: " + e.getMessage(), e);
        }
    }

    @Override
    public CompletableFuture<Void> executeCommand(String command, WebSocketSession session) {
        return CompletableFuture.runAsync(() -> {
            try {
                String[] parts = command.trim().split("\\s+");
                if (parts.length == 0) return;

                switch (parts[0].toLowerCase()) {
                    case "ls":
                        listObjects(session, parts.length > 1 ? parts[1] : "");
                        break;
                    case "cat":
                        if (parts.length > 1) {
                            getObjectContent(session, parts[1]);
                        } else {
                            sendError(session, "Usage: cat <object-key>");
                        }
                        break;
                    case "help":
                        showHelp(session);
                        break;
                    default:
                        sendError(session, "Unknown command. Type 'help' for available commands.");
                }
            } catch (Exception e) {
                try {
                    sendError(session, e.getMessage());
                } catch (Exception ex) {
                    // Ignore send error
                }
            }
        });
    }

    private void listObjects(WebSocketSession session, String prefix) throws Exception {
        ListObjectsV2Request request = ListObjectsV2Request.builder()
            .bucket(bucket)
            .prefix(prefix)
            .build();

        ListObjectsV2Response response = s3Client.listObjectsV2(request);
        StringBuilder output = new StringBuilder();
        
        for (S3Object object : response.contents()) {
            output.append(String.format("%s\t%d\t%s\n", 
                object.lastModified(),
                object.size(),
                object.key()));
        }
        
        sendMessage(session, output.toString());
    }

    private void getObjectContent(WebSocketSession session, String key) throws Exception {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

            // Stream the first part of the object (preview)
            byte[] bytes = s3Client.getObject(request)
                .readAllBytes();
            String content = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            if (content.length() > 1000) {
                content = content.substring(0, 1000) + "...";
            }
                
            sendMessage(session, content);
        } catch (Exception e) {
            sendError(session, "Failed to read object: " + e.getMessage());
        }
    }

    private void showHelp(WebSocketSession session) throws Exception {
        String helpText = """
            Available commands:
            ls [prefix]    List objects in bucket (optionally filtered by prefix)
            cat <key>     Show content of an object
            help          Show this help message
            """;
        sendMessage(session, helpText);
    }

    @Override
    public boolean supportsStorageType(String storageType) {
        return "S3".equalsIgnoreCase(storageType);
    }

    @Override
    public void close() {
        super.close();
        if (s3Client != null) {
            s3Client.close();
        }
    }

    // Configuration class for S3
    private static class S3Config {
        @JsonProperty
        private String bucket;
        @JsonProperty
        private String region;
        
        public String getBucket() { return bucket; }
        public String getRegion() { return region; }
    }
}