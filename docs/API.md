# API Documentation

## Authentication

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "roles": ["string"],
    "permissions": ["string"]
  }
}
```

## User Management

### Create User
```
POST /api/users
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "roles": ["string"]
}
```

### Update User
```
PUT /api/users/{id}
Content-Type: application/json

{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "roles": ["string"]
}
```

### List Users
```
GET /api/users
Authorization: Bearer {token}

Response:
{
  "data": [{
    "id": "number",
    "username": "string",
    "email": "string",
    "roles": ["string"],
    "status": "string",
    "createdAt": "string"
  }]
}
```

## Storage Management

### Create Storage Configuration
```
POST /api/storage
Content-Type: application/json

{
  "name": "string",
  "storageType": "string",
  "configuration": {
    // Provider-specific configuration
  }
}
```

### List Storage Configurations
```
GET /api/storage

Response:
{
  "data": [{
    "id": "number",
    "name": "string",
    "storageType": "string",
    "status": "string",
    "isDefault": "boolean",
    "createdAt": "string"
  }]
}
```

### Test Storage Connection
```
POST /api/storage/{id}/test

Response:
{
  "data": {
    "status": "string",
    "lastTestResult": "string",
    "lastTestedAt": "string"
  }
}
```

## Connection Management

### Create Connection
```
POST /api/connections
Content-Type: application/json

{
  "connectionName": "string",
  "dataSourceType": "string",
  "configuration": {
    // Source-specific configuration
  }
}
```

### List Connections
```
GET /api/connections

Response:
{
  "data": [{
    "id": "number",
    "name": "string",
    "type": "string",
    "status": "string",
    "createdAt": "string"
  }]
}
```

### Test Connection
```
POST /api/connections/{id}/test

Response:
{
  "status": "string",
  "message": "string"
}
```

## Data Access

### Query Data
```
GET /api/data
Query Parameters:
- source (string): Data source identifier
- from (string): Start timestamp
- to (string): End timestamp
- limit (number): Maximum number of records
- filter (string): Filter expression

Response:
{
  "data": [{
    "timestamp": "string",
    "value": "any",
    "source": "string",
    "tags": {}
  }]
}
```

### Real-time Data Subscription
```
WebSocket: /ws/data/{sourceId}

Message Format:
{
  "type": "data",
  "payload": {
    "timestamp": "string",
    "value": "any",
    "source": "string"
  }
}
```

## Error Responses

All API endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": true,
  "message": "Error description",
  "validationErrors": {
    "field": ["error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": true,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": true,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": true,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": true,
  "message": "Internal server error"
}
```