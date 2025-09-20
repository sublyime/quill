# Data Sources

## Overview
Quill supports multiple data source types through a unified interface, allowing for consistent data collection regardless of the source protocol.

## Supported Data Sources

### 1. Modbus TCP/IP

#### Configuration
```java
public class ModbusConfig {
    private String ipAddress;        // Device IP address
    private Integer port;            // TCP port (default: 502)
    private Integer slaveId;         // Device ID (1-255)
    private String registerType;     // holding/input/coil/discrete
    private Integer startAddress;    // Starting register address
    private Integer quantity;        // Number of registers to read
    private Integer pollInterval;    // Polling interval in ms
    private Integer connectionTimeout; // Connection timeout in ms
    private Integer maxRetries;      // Maximum retry attempts
}
```

#### Features
- Support for all Modbus register types
- Configurable polling intervals
- Automatic reconnection
- Data validation
- Error handling with retry mechanism

#### Register Types
1. **Holding Registers** (Read/Write)
   - 16-bit registers
   - Function codes: 03 (read), 06 (write single), 16 (write multiple)

2. **Input Registers** (Read-only)
   - 16-bit registers
   - Function code: 04 (read)

3. **Coils** (Read/Write)
   - Single bit
   - Function codes: 01 (read), 05 (write single), 15 (write multiple)

4. **Discrete Inputs** (Read-only)
   - Single bit
   - Function code: 02 (read)

### 2. MQTT

#### Configuration
```java
public class MqttConfig {
    private String brokerUrl;        // MQTT broker URL
    private Integer port;            // Broker port
    private String clientId;         // Client identifier
    private String topic;            // Topic to subscribe/publish
    private String username;         // Authentication username
    private String password;         // Authentication password
    private Boolean useTls;          // TLS/SSL encryption
    private Integer qos;             // Quality of Service level
}
```

#### Features
- Support for MQTT 3.1.1 and 5.0
- TLS/SSL encryption
- QoS levels 0, 1, and 2
- Last Will and Testament (LWT)
- Persistent sessions
- Message retention

## Adding New Data Sources

### Implementation Steps

1. **Create Configuration Class**
```java
public class NewSourceConfig {
    // Configuration parameters
}
```

2. **Implement DataSourceHandler Interface**
```java
public class NewSourceHandler implements DataSourceHandler {
    @Override
    public void connect() { }
    
    @Override
    public void disconnect() { }
    
    @Override
    public DataRecord read() { }
    
    @Override
    public void write(DataRecord data) { }
}
```

3. **Add Connection Manager**
```java
@Service
public class NewSourceConnectionManager {
    // Connection management logic
}
```

4. **Update Factory**
```java
public class DataSourceFactory {
    public DataSourceHandler createHandler(String type, Map<String, String> config) {
        switch (type) {
            case "new-source":
                return new NewSourceHandler(config);
            // ...
        }
    }
}
```

### Best Practices

1. **Error Handling**
   - Use the RetryStrategy for transient failures
   - Implement proper connection cleanup
   - Log meaningful error messages

2. **Resource Management**
   - Properly close connections
   - Implement connection pooling if needed
   - Handle cleanup in disconnect()

3. **Data Validation**
   - Validate configuration parameters
   - Verify data format and ranges
   - Handle missing or invalid data

4. **Testing**
   - Unit test the handler implementation
   - Test error scenarios
   - Verify retry behavior
   - Test data validation