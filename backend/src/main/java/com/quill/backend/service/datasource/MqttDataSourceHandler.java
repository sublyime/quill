package com.quill.backend.service.datasource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quill.backend.model.Connection;
import com.quill.backend.model.DataRecord;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class MqttDataSourceHandler implements DataSourceHandler {

    private Connection connection;
    private MqttClient mqttClient;
    private final AtomicBoolean isCollecting;
    private final Map<String, Object> latestValues;
    private final ObjectMapper objectMapper;

    public MqttDataSourceHandler() {
        this.isCollecting = new AtomicBoolean(false);
        this.latestValues = new ConcurrentHashMap<>();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public void initialize(Connection connection) throws Exception {
        this.connection = connection;
        String brokerUrl = String.format("tcp://%s:%s",
            connection.getConfigurationValue("host"),
            connection.getConfigurationValue("port")
        );
        String clientId = "quill_" + connection.getId();
        
        mqttClient = new MqttClient(brokerUrl, clientId);
        MqttConnectOptions options = new MqttConnectOptions();
        
        String username = connection.getConfigurationValue("username");
        String password = connection.getConfigurationValue("password");
        if (username != null && password != null) {
            options.setUserName(username);
            options.setPassword(password.toCharArray());
        }
        
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        
        mqttClient.connect(options);
        
        // Set up message callback
        mqttClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                isCollecting.set(false);
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) {
                try {
                    String payload = new String(message.getPayload());
                    latestValues.put(topic, payload);
                } catch (Exception e) {
                    // Log error but don't stop collection
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
                // Not used for subscriptions
            }
        });
    }

    @Override
    public CompletableFuture<Void> startCollection() {
        return CompletableFuture.runAsync(() -> {
            try {
                if (!isCollecting.get() && mqttClient != null && mqttClient.isConnected()) {
                    String topic = connection.getConfigurationValue("topic");
                    if (topic == null) {
                        topic = "#"; // Subscribe to all topics if none specified
                    }
                    mqttClient.subscribe(topic);
                    isCollecting.set(true);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to start MQTT data collection", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> stopCollection() {
        return CompletableFuture.runAsync(() -> {
            try {
                if (isCollecting.get() && mqttClient != null && mqttClient.isConnected()) {
                    String topic = connection.getConfigurationValue("topic");
                    if (topic == null) {
                        topic = "#";
                    }
                    mqttClient.unsubscribe(topic);
                    isCollecting.set(false);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to stop MQTT data collection", e);
            }
        });
    }

    @Override
    public boolean isCollecting() {
        return isCollecting.get();
    }

    @Override
    public List<DataRecord> readLatestData() {
        List<DataRecord> records = new ArrayList<>();
        latestValues.forEach((topic, value) -> {
            DataRecord record = new DataRecord();
            record.setSourceId(connection.getId().toString());
            record.setDataType("mqtt");
            record.setTimestamp(LocalDateTime.now());
            try {
                record.setContent(objectMapper.writeValueAsString(Map.of(
                    "topic", topic,
                    "value", value
                )));
            } catch (Exception e) {
                // Skip this record if serialization fails
            }
            records.add(record);
        });
        return records;
    }

    @Override
    public boolean writeData(String topic, Object value) throws Exception {
        if (mqttClient != null && mqttClient.isConnected()) {
            String payload;
            if (value instanceof String) {
                payload = (String) value;
            } else {
                payload = objectMapper.writeValueAsString(value);
            }
            MqttMessage message = new MqttMessage(payload.getBytes());
            mqttClient.publish(topic, message);
            return true;
        }
        return false;
    }

    @Override
    public List<DataRecord> getDiagnostics() {
        List<DataRecord> diagnostics = new ArrayList<>();
        
        DataRecord connectionStatus = new DataRecord();
        connectionStatus.setSourceId(connection.getId().toString());
        connectionStatus.setDataType("diagnostic");
        connectionStatus.setTimestamp(LocalDateTime.now());
        
        boolean isConnected = mqttClient != null && mqttClient.isConnected();
        connectionStatus.setContent(String.format(
            "{\"type\":\"connection_status\",\"value\":\"%s\",\"broker\":\"%s:%s\"}",
            isConnected ? "CONNECTED" : "DISCONNECTED",
            connection.getConfigurationValue("host"),
            connection.getConfigurationValue("port")
        ));
        
        diagnostics.add(connectionStatus);
        
        // Add subscription status
        DataRecord subscriptionStatus = new DataRecord();
        subscriptionStatus.setSourceId(connection.getId().toString());
        subscriptionStatus.setDataType("diagnostic");
        subscriptionStatus.setTimestamp(LocalDateTime.now());
        subscriptionStatus.setContent(String.format(
            "{\"type\":\"subscription_status\",\"topic\":\"%s\",\"active_topics\":%d}",
            connection.getConfigurationValue("topic"),
            latestValues.size()
        ));
        
        diagnostics.add(subscriptionStatus);
        
        return diagnostics;
    }

    @Override
    public void shutdown() {
        try {
            if (mqttClient != null) {
                if (mqttClient.isConnected()) {
                    mqttClient.disconnect();
                }
                mqttClient.close();
            }
        } catch (Exception e) {
            // Log error but continue shutdown
        } finally {
            isCollecting.set(false);
        }
    }

    @Override
    public String getSourceType() {
        return "mqtt";
    }

    @Override
    public boolean testConnection() throws Exception {
        String brokerUrl = String.format("tcp://%s:%s",
            connection.getConfigurationValue("host"),
            connection.getConfigurationValue("port")
        );
        String testClientId = "quill_test_" + connection.getId();
        
        try (MqttClient testClient = new MqttClient(brokerUrl, testClientId)) {
            MqttConnectOptions options = new MqttConnectOptions();
            
            String username = connection.getConfigurationValue("username");
            String password = connection.getConfigurationValue("password");
            if (username != null && password != null) {
                options.setUserName(username);
                options.setPassword(password.toCharArray());
            }
            
            options.setCleanSession(true);
            options.setConnectionTimeout(5); // 5 seconds timeout for test
            
            testClient.connect(options);
            return testClient.isConnected();
        } catch (Exception e) {
            return false;
        }
    }
}