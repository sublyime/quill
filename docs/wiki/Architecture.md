# Architecture Overview

## System Architecture

Quill follows a modular architecture with clear separation of concerns:

```
[Frontend (Next.js)] <-> [Backend (Spring Boot)] <-> [Data Sources / Storage Systems]
```

### Core Components

1. **Frontend Layer**
   - Next.js application
   - Real-time data visualization
   - Configuration management UI
   - User management interface

2. **Backend Layer**
   - Spring Boot application
   - RESTful API endpoints
   - Connection management
   - Data processing pipeline
   - Storage management

3. **Data Sources**
   - Modbus TCP/IP connections
   - MQTT connections
   - Future extensibility for other protocols

4. **Storage Systems**
   - Local database storage
   - AWS S3 integration
   - Extensible storage framework

## Key Design Patterns

### Strategy Pattern
Used in multiple components:
- `RetryStrategy`: Implements exponential backoff for handling transient failures
- `DataSourceHandler`: Interface for different data source implementations
- `StorageWriter`: Interface for different storage system implementations

### Factory Pattern
- Connection factory for creating appropriate connection handlers
- Storage factory for creating storage system instances

### Repository Pattern
- Used for data access abstraction
- Implemented for different entity types (DataRecord, Connection, etc.)

## Error Handling

The system implements a robust error handling strategy:
- Exponential backoff retry mechanism
- Specific exception types for different failure scenarios
- Proper error propagation and logging

## Data Flow

1. **Data Collection**
   ```
   Data Source -> Connection Manager -> Data Handler -> Data Processor
   ```

2. **Data Storage**
   ```
   Data Processor -> Storage Writer -> Storage System
   ```

3. **Data Retrieval**
   ```
   Storage System -> Data Service -> API -> Frontend
   ```