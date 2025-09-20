# Configuration Guide

## System Requirements

### Backend
- Java 17 or later
- Maven 3.8+
- PostgreSQL 13+
- Spring Boot 3.x

### Frontend
- Node.js 18+
- npm 8+
- Next.js 13+

## Initial Setup

### 1. Clone Repository
```powershell
git clone https://github.com/sublyime/quill.git
cd quill
```

### 2. Backend Configuration

#### Application Properties
File: `backend/src/main/resources/application.properties`
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/quill
spring.datasource.username=quill_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# Logging Configuration
logging.level.root=INFO
logging.level.com.quill=DEBUG

# Connection Pool Configuration
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000

# AWS Configuration (if using S3)
aws.region=us-east-1
aws.s3.bucket=your-bucket-name
```

### 3. Frontend Configuration

#### Environment Variables
File: `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## Data Source Configuration

### 1. Modbus Configuration

```json
{
  "type": "modbus",
  "name": "Device1",
  "configuration": {
    "ipAddress": "192.168.1.100",
    "port": 502,
    "slaveId": 1,
    "registerType": "holding",
    "startAddress": 0,
    "quantity": 10,
    "pollInterval": 1000,
    "connectionTimeout": 3000,
    "maxRetries": 3
  }
}
```

### 2. MQTT Configuration

```json
{
  "type": "mqtt",
  "name": "Sensor1",
  "configuration": {
    "brokerUrl": "mqtt://broker.example.com",
    "port": 1883,
    "clientId": "quill-client",
    "topic": "sensors/temperature",
    "username": "mqtt_user",
    "password": "mqtt_password",
    "useTls": true,
    "qos": 1
  }
}
```

## Storage Configuration

### 1. Local Database Storage

```json
{
  "type": "database",
  "name": "LocalDB",
  "configuration": {
    "url": "jdbc:postgresql://localhost:5432/quill",
    "username": "quill_user",
    "password": "your_password",
    "maxPoolSize": 10,
    "minPoolSize": 5
  },
  "enabled": true,
  "retentionDays": 30
}
```

### 2. AWS S3 Storage

```json
{
  "type": "s3",
  "name": "CloudStorage",
  "configuration": {
    "region": "us-east-1",
    "bucketName": "your-bucket-name",
    "accessKey": "your-access-key",
    "secretKey": "your-secret-key",
    "encryption": true,
    "storageClass": "STANDARD"
  },
  "enabled": true,
  "retentionDays": 90
}
```

## Security Configuration

### 1. SSL/TLS Setup

```properties
# SSL Configuration
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=your_keystore_password
server.ssl.keyStoreType=PKCS12
server.ssl.keyAlias=tomcat
```

### 2. Authentication Configuration

```properties
# JWT Configuration
jwt.secret=your_jwt_secret
jwt.expiration=86400000

# CORS Configuration
cors.allowed-origins=http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
```

## Development Tools

### 1. Maven Configuration
File: `pom.xml`
```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

### 2. NPM Scripts
File: `package.json`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Monitoring Configuration

### 1. Metrics Collection

```properties
# Actuator Configuration
management.endpoints.web.exposure.include=health,metrics,prometheus
management.endpoint.health.show-details=always

# Prometheus Configuration
management.metrics.export.prometheus.enabled=true
```

### 2. Logging Configuration

```properties
# Logging Configuration
logging.file.name=logs/quill.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.file.max-size=10MB
logging.file.max-history=10
```