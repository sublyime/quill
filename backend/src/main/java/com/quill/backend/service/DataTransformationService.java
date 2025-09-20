package com.quill.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.quill.backend.model.Connection;
import com.quill.backend.model.DataRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DataTransformationService {
    private static final Logger logger = LoggerFactory.getLogger(DataTransformationService.class);
    private final ObjectMapper objectMapper;
    private final Map<String, DataTransformer> transformers;

    public DataTransformationService() {
        this.objectMapper = new ObjectMapper();
        this.transformers = new ConcurrentHashMap<>();
        initializeTransformers();
    }

    private void initializeTransformers() {
        // Register transformers for each source type
        transformers.put("modbus_tcp", this::transformModbusData);
        transformers.put("mqtt", this::transformMqttData);
        transformers.put("serial", this::transformSerialData);
        transformers.put("api", this::transformApiData);
    }

    /**
     * Transform raw data into a standardized DataRecord
     */
    public DataRecord transformData(Connection connection, Object rawData) {
        try {
            String sourceType = connection.getSourceType();
            DataTransformer transformer = transformers.get(sourceType.toLowerCase());
            
            if (transformer == null) {
                throw new IllegalArgumentException("No transformer found for source type: " + sourceType);
            }

            JsonNode transformedData = transformer.transform(connection, rawData);
            DataRecord record = new DataRecord();
            record.setSourceId(connection.getId().toString());
            record.setDataType(sourceType);
            record.setTimestamp(LocalDateTime.now());
            record.setContent(transformedData.toString());

            return record;
        } catch (Exception e) {
            logger.error("Error transforming data for connection {}: {}", connection.getId(), e.getMessage(), e);
            throw new RuntimeException("Data transformation failed", e);
        }
    }

    private JsonNode transformModbusData(Connection connection, Object rawData) throws Exception {
        ObjectNode node = objectMapper.createObjectNode();
        
        if (rawData instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) rawData;
            
            node.put("register", (Integer) data.get("register"));
            node.put("value", (Integer) data.get("value"));
            node.put("registerType", (String) data.get("registerType"));
            node.put("quality", (String) data.getOrDefault("quality", "GOOD"));
            if (data.containsKey("errorMessage")) {
                node.put("errorMessage", (String) data.get("errorMessage"));
            }
        }
        
        addMetadata(node, connection);
        return node;
    }

    private JsonNode transformMqttData(Connection connection, Object rawData) throws Exception {
        ObjectNode node = objectMapper.createObjectNode();
        
        if (rawData instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) rawData;
            
            node.put("topic", (String) data.get("topic"));
            
            Object payload = data.get("payload");
            if (payload != null) {
                try {
                    // Try to parse as JSON first
                    JsonNode payloadNode = objectMapper.readTree(payload.toString());
                    node.set("payload", payloadNode);
                } catch (Exception e) {
                    // If not valid JSON, store as string
                    node.put("payload", payload.toString());
                }
            }
        }
        
        addMetadata(node, connection);
        return node;
    }

    private JsonNode transformSerialData(Connection connection, Object rawData) throws Exception {
        ObjectNode node = objectMapper.createObjectNode();
        
        if (rawData instanceof String) {
            node.put("data", (String) rawData);
        } else if (rawData instanceof byte[]) {
            node.put("data", new String((byte[]) rawData));
            node.put("rawHex", bytesToHex((byte[]) rawData));
        }
        
        addMetadata(node, connection);
        return node;
    }

    private JsonNode transformApiData(Connection connection, Object rawData) throws Exception {
        ObjectNode node = objectMapper.createObjectNode();
        
        if (rawData instanceof String) {
            try {
                JsonNode apiData = objectMapper.readTree((String) rawData);
                node.set("data", apiData);
            } catch (Exception e) {
                node.put("data", (String) rawData);
            }
        } else if (rawData instanceof Map) {
            node.set("data", objectMapper.valueToTree(rawData));
        }
        
        addMetadata(node, connection);
        return node;
    }

    private void addMetadata(ObjectNode node, Connection connection) {
        node.put("connectionId", connection.getId());
        node.put("connectionName", connection.getName());
        node.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        node.put("sourceType", connection.getSourceType());
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02X", b));
        }
        return result.toString();
    }

    @FunctionalInterface
    private interface DataTransformer {
        JsonNode transform(Connection connection, Object data) throws Exception;
    }
}