# Storage Configuration Guide

This guide explains how to configure and manage different storage providers in DataQuill.

## Supported Storage Types

### 1. Local File System
```json
{
  "storageType": "local",
  "configuration": {
    "basePath": "/path/to/storage",
    "maxSize": "1000GB",
    "retention": "30d"
  }
}
```

### 2. S3 Compatible Storage
```json
{
  "storageType": "s3",
  "configuration": {
    "endpoint": "s3.amazonaws.com",
    "bucket": "your-bucket",
    "region": "us-east-1",
    "accessKey": "your-access-key",
    "secretKey": "your-secret-key"
  }
}
```

### 3. Time Series Database
```json
{
  "storageType": "tsdb",
  "configuration": {
    "type": "influxdb",
    "url": "http://localhost:8086",
    "token": "your-token",
    "org": "your-org",
    "bucket": "your-bucket"
  }
}
```

## Configuration Fields

### Common Fields
- `name`: Unique identifier for the storage configuration
- `storageType`: Type of storage provider
- `isDefault`: Whether this is the default storage
- `status`: Current status of the storage

### Provider-Specific Fields

#### Local Storage
- `basePath`: Root directory for data storage
- `maxSize`: Maximum storage size
- `retention`: Data retention period
- `compression`: Enable/disable compression

#### S3 Storage
- `endpoint`: S3 endpoint URL
- `bucket`: S3 bucket name
- `region`: AWS region
- `accessKey`: AWS access key
- `secretKey`: AWS secret key
- `pathPrefix`: Optional prefix for stored objects

#### Time Series DB
- `type`: Database type (influxdb, prometheus, etc.)
- `url`: Database URL
- `credentials`: Authentication details
- `retention`: Data retention policy
- `bufferSize`: Write buffer size

## Storage Management

### Adding New Storage

1. Navigate to Storage Configuration
2. Click "Add Storage Configuration"
3. Select storage type
4. Fill in configuration details
5. Test connection
6. Save configuration

### Testing Storage Connection

The test operation performs:
1. Connection verification
2. Write permission check
3. Read permission check
4. Performance test

### Setting Default Storage

1. Select storage configuration
2. Click "Set as Default"
3. Confirm change

### Storage Monitoring

Monitor:
- Storage usage
- Write performance
- Read performance
- Error rates
- Connection status

## Best Practices

1. **Security**
   - Use environment variables for sensitive data
   - Rotate credentials regularly
   - Use minimal required permissions

2. **Performance**
   - Configure appropriate buffer sizes
   - Set up proper indexing
   - Monitor storage metrics

3. **Maintenance**
   - Regular backup configuration
   - Monitor storage usage
   - Test connections periodically

4. **Data Management**
   - Configure retention policies
   - Set up data lifecycle rules
   - Monitor data quality

## Troubleshooting

### Common Issues

1. Connection Failures
   - Check network connectivity
   - Verify credentials
   - Check firewall rules

2. Performance Issues
   - Review buffer sizes
   - Check network latency
   - Monitor system resources

3. Storage Full
   - Check retention policies
   - Review data lifecycle
   - Monitor storage usage

### Error Messages

| Error Code | Description | Solution |
|------------|-------------|----------|
| ST001 | Connection failed | Check credentials and network |
| ST002 | Write permission denied | Verify storage permissions |
| ST003 | Storage full | Clean up or expand storage |
| ST004 | Read timeout | Check network latency |

## Security Considerations

1. **Authentication**
   - Use secure credential storage
   - Implement key rotation
   - Monitor access logs

2. **Data Protection**
   - Enable encryption at rest
   - Use secure transport (TLS)
   - Regular security audits

3. **Access Control**
   - Implement least privilege
   - Regular permission review
   - Audit access patterns

## Monitoring and Maintenance

### Metrics to Monitor

1. Storage Metrics
   - Usage percentage
   - Growth rate
   - IOPS
   - Latency

2. Performance Metrics
   - Write throughput
   - Read latency
   - Error rates
   - Connection status

### Maintenance Tasks

1. Regular Tasks
   - Test connections
   - Verify backups
   - Review permissions
   - Update configurations

2. Periodic Reviews
   - Storage usage trends
   - Performance patterns
   - Security compliance
   - Cost optimization