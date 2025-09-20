package com.quill.backend.stream;

import org.springframework.web.socket.WebSocketSession;
import java.util.concurrent.CompletableFuture;
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.io.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;
import com.quill.backend.model.Storage;
import com.fasterxml.jackson.annotation.JsonProperty;

public class FileSystemStreamHandler extends BaseStorageStreamHandler {
    private static final Logger logger = LoggerFactory.getLogger(FileSystemStreamHandler.class);
    private Path basePath;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void initialize(Storage storage) {
        super.initialize(storage);
        try {
            FsConfig config = objectMapper.readValue(storage.getConfiguration(), FsConfig.class);
            this.basePath = Paths.get(config.getBasePath()).toAbsolutePath().normalize();
            
            // Validate base path exists and is accessible
            if (!Files.exists(basePath)) {
                throw new IOException("Base path does not exist: " + basePath);
            }
            
            // Test write access if needed
            if (config.isWritable() && !Files.isWritable(basePath)) {
                throw new IOException("Base path is not writable: " + basePath);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize file system handler: " + e.getMessage(), e);
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
                        listFiles(session, parts.length > 1 ? parts[1] : ".");
                        break;
                    case "cat":
                        if (parts.length > 1) {
                            showFileContent(session, parts[1]);
                        } else {
                            sendError(session, "Usage: cat <filename>");
                        }
                        break;
                    case "tail":
                        if (parts.length > 1) {
                            int lines = parts.length > 2 ? Integer.parseInt(parts[2]) : 10;
                            tailFile(session, parts[1], lines);
                        } else {
                            sendError(session, "Usage: tail <filename> [lines]");
                        }
                        break;
                    case "head":
                        if (parts.length > 1) {
                            int lines = parts.length > 2 ? Integer.parseInt(parts[2]) : 10;
                            headFile(session, parts[1], lines);
                        } else {
                            sendError(session, "Usage: head <filename> [lines]");
                        }
                        break;
                    case "find":
                        if (parts.length > 1) {
                            findFiles(session, parts[1]);
                        } else {
                            sendError(session, "Usage: find <pattern>");
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
                    logger.error("Failed to send error message", ex);
                }
            }
        });
    }

    private void listFiles(WebSocketSession session, String relativePath) throws Exception {
        Path targetPath = resolveAndValidatePath(relativePath);
        try (var stream = Files.list(targetPath)) {
            StringBuilder output = new StringBuilder();
            output.append("Contents of ").append(basePath.relativize(targetPath)).append(":\n");
            
            stream.forEach(path -> {
                try {
                    var attrs = Files.readAttributes(path, BasicFileAttributes.class);
                    String type = attrs.isDirectory() ? "d" : "-";
                    String size = attrs.isDirectory() ? "" : String.valueOf(attrs.size());
                    String modified = attrs.lastModifiedTime().toString();
                    String name = path.getFileName().toString();
                    
                    output.append(String.format("%s %10s %s %s\n", 
                        type, size, modified, name));
                } catch (IOException e) {
                    logger.error("Error reading file attributes", e);
                }
            });
            
            sendMessage(session, output.toString());
        }
    }

    private void showFileContent(WebSocketSession session, String relativePath) throws Exception {
        Path filePath = resolveAndValidatePath(relativePath);
        validateFileAccess(filePath);
        
        try {
            String content = Files.readString(filePath);
            sendMessage(session, content);
        } catch (OutOfMemoryError e) {
            sendError(session, "File too large. Use 'head' or 'tail' instead.");
        }
    }

    private void tailFile(WebSocketSession session, String relativePath, int lines) throws Exception {
        Path filePath = resolveAndValidatePath(relativePath);
        validateFileAccess(filePath);
        
        try (var stream = Files.lines(filePath)) {
            var lastLines = stream.collect(Collectors.collectingAndThen(
                Collectors.toList(),
                list -> list.subList(Math.max(0, list.size() - lines), list.size())
            ));
            
            StringBuilder output = new StringBuilder();
            for (String line : lastLines) {
                output.append(line).append("\n");
            }
            sendMessage(session, output.toString());
        }
    }

    private void headFile(WebSocketSession session, String relativePath, int lines) throws Exception {
        Path filePath = resolveAndValidatePath(relativePath);
        validateFileAccess(filePath);
        
        try (var stream = Files.lines(filePath).limit(lines)) {
            StringBuilder output = new StringBuilder();
            stream.forEach(line -> output.append(line).append("\n"));
            sendMessage(session, output.toString());
        }
    }

    private void findFiles(WebSocketSession session, String pattern) throws Exception {
        String glob = "glob:" + pattern;
        PathMatcher matcher = FileSystems.getDefault().getPathMatcher(glob);
        
        try (var stream = Files.walk(basePath)) {
            StringBuilder output = new StringBuilder();
            output.append("Files matching pattern '").append(pattern).append("':\n");
            
            stream.filter(path -> matcher.matches(path.getFileName()))
                 .map(path -> basePath.relativize(path))
                 .forEach(path -> output.append(path).append("\n"));
                 
            sendMessage(session, output.toString());
        }
    }

    private Path resolveAndValidatePath(String relativePath) throws IOException {
        Path normalized = basePath.resolve(relativePath).normalize();
        if (!normalized.startsWith(basePath)) {
            throw new IOException("Access denied: Path outside base directory");
        }
        return normalized;
    }

    private void validateFileAccess(Path path) throws IOException {
        if (!Files.exists(path)) {
            throw new IOException("File not found: " + basePath.relativize(path));
        }
        if (!Files.isRegularFile(path)) {
            throw new IOException("Not a regular file: " + basePath.relativize(path));
        }
        if (!Files.isReadable(path)) {
            throw new IOException("File not readable: " + basePath.relativize(path));
        }
    }

    private void showHelp(WebSocketSession session) throws Exception {
        String helpText = """
            Available commands:
            ls [path]           List files in directory
            cat <file>         Show file contents
            tail <file> [n]    Show last n lines (default 10)
            head <file> [n]    Show first n lines (default 10)
            find <pattern>     Find files matching glob pattern
            help              Show this help message
            
            Examples:
            ls .
            cat config.json
            tail error.log 20
            find *.txt
            """;
        sendMessage(session, helpText);
    }

    @Override
    public boolean supportsStorageType(String storageType) {
        return "FILESYSTEM".equalsIgnoreCase(storageType);
    }

    private static class FsConfig {
        @JsonProperty
        private String basePath;
        @JsonProperty
        private boolean writable;
        
        public String getBasePath() { return basePath; }
        public boolean isWritable() { return writable; }
    }
}