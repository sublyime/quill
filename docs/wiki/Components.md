# Components

## Core Components

### Connection Management

#### ModbusConnectionManager
Handles Modbus TCP/IP connections with the following features:
- Connection pooling
- Automatic reconnection
- Configurable timeouts
- Support for different register types:
  - Holding registers
  - Input registers
  - Coils
  - Discrete inputs

```java
public class ModbusConnectionManager {
    // Manages individual Modbus TCP connections
    // Implements connection pooling and retry logic
}
```

### Retry Strategy

The `RetryStrategy` class implements an exponential backoff mechanism for handling transient failures:

```java
public class RetryStrategy {
    private final int maxRetries;
    private final Duration initialDelay;
    private final Duration maxDelay;
    private final double backoffMultiplier;
    
    // Implements exponential backoff with configurable parameters
}
```

Key features:
- Configurable retry attempts
- Exponential backoff
- Maximum delay cap
- Custom retry conditions

Default Configuration:
- Maximum 3 retry attempts
- 1 second initial delay
- 30 seconds maximum delay
- Exponential backoff with multiplier of 2

### Storage Service

Manages data persistence across different storage systems:
- Local database storage
- AWS S3 integration
- Extensible storage framework

Features:
- Automatic failover
- Data validation
- Configurable storage options
- Batch processing support

### Data Management Service

Handles data processing and transformation:
- Data validation
- Format conversion
- Batch processing
- Error handling

## Configuration

### ModbusConfig
Configuration class for Modbus connections:
```java
public class ModbusConfig {
    private String ipAddress;
    private Integer port;
    private Integer slaveId;
    private String registerType;
    private Integer startAddress;
    private Integer quantity;
    private Integer pollInterval;
    private Integer connectionTimeout;
    private Integer maxRetries;
}
```

Validation:
- IP address format validation
- Port range validation (1-65535)
- Slave ID range validation (1-255)
- Register type validation
- Non-negative value validation for addresses and quantities

## Recent Changes

### Error Handling Improvements
1. Enhanced RetryStrategy with better null handling
2. Added comprehensive documentation
3. Improved error messages and logging

### Code Cleanup
1. Removed unused imports:
   - `ModbusException`
   - `JsonNode`
   - `ByteArrayInputStream`
   - `Connection`
   - `Duration`
2. Removed unused variables for cleaner code
3. Added comprehensive JavaDoc documentation