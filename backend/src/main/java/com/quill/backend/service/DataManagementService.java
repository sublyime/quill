package com.quill.backend.service;

import com.quill.backend.model.DataRecord;
import com.quill.backend.model.StorageConfig;
import com.quill.backend.repository.DataRecordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Statement;

@Service
public class DataManagementService {
    
    @Autowired
    private DataRecordRepository dataRecordRepository;
    
    @Autowired
    private StorageService storageService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TypeReference<Map<String, Object>> mapTypeRef = new TypeReference<Map<String, Object>>() {};
    private final DateTimeFormatter timestampFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    
    // Store data using the default or specified storage configuration
    public DataRecord storeData(String sourceId, String dataType, Object payload, Map<String, Object> metadata) {
        try {
            Optional<StorageConfig> defaultStorage = storageService.findDefaultStorage();
            
            DataRecord record = new DataRecord();
            record.setSourceId(sourceId);
            record.setDataType(dataType);
            record.setPayload(objectMapper.writeValueAsString(payload));
            record.setTimestamp(LocalDateTime.now());
            
            if (metadata != null && !metadata.isEmpty()) {
                record.setMetadata(objectMapper.writeValueAsString(metadata));
            }
            
            if (defaultStorage.isPresent()) {
                record.setStorageConfigId(defaultStorage.get().getId());
            }
            
            DataRecord savedRecord = dataRecordRepository.save(record);
            
            // Store to external storage asynchronously to avoid blocking
            if (defaultStorage.isPresent()) {
                try {
                    storeToExternalStorage(defaultStorage.get(), savedRecord);
                } catch (Exception e) {
                    System.err.println("External storage failed (non-blocking): " + e.getMessage());
                    // Don't fail the main operation
                }
            }
            
            return savedRecord;
        } catch (Exception e) {
            throw new RuntimeException("Failed to store data: " + e.getMessage());
        }
    }
    
    // Batch store multiple data records
    @Transactional
    public List<DataRecord> storeDataBatch(List<DataRecord> records) {
        try {
            Optional<StorageConfig> defaultStorage = storageService.findDefaultStorage();
            
            for (DataRecord record : records) {
                if (record.getTimestamp() == null) {
                    record.setTimestamp(LocalDateTime.now());
                }
                if (defaultStorage.isPresent()) {
                    record.setStorageConfigId(defaultStorage.get().getId());
                }
            }
            
            List<DataRecord> savedRecords = dataRecordRepository.saveAll(records);
            
            // Store to external storage asynchronously
            if (defaultStorage.isPresent()) {
                for (DataRecord record : savedRecords) {
                    try {
                        storeToExternalStorage(defaultStorage.get(), record);
                    } catch (Exception e) {
                        System.err.println("External storage failed for record " + record.getId() + ": " + e.getMessage());
                        // Don't fail the batch operation
                    }
                }
            }
            
            return savedRecords;
        } catch (Exception e) {
            throw new RuntimeException("Failed to store data batch: " + e.getMessage());
        }
    }
    
    // Retrieve data by various criteria
    public List<DataRecord> getDataBySource(String sourceId) {
        return dataRecordRepository.findBySourceIdOrderByTimestampDesc(sourceId);
    }
    
    public List<DataRecord> getDataByType(String dataType) {
        return dataRecordRepository.findByDataTypeOrderByTimestampDesc(dataType);
    }
    
    public List<DataRecord> getDataByTimeRange(LocalDateTime start, LocalDateTime end) {
        return dataRecordRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
    }
    
    public List<DataRecord> getRecentData(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return dataRecordRepository.findRecentData(since);
    }
    
    public List<DataRecord> getSourceDataInRange(String sourceId, LocalDateTime start, LocalDateTime end) {
        return dataRecordRepository.findBySourceIdAndTimestampBetweenOrderByTimestampDesc(sourceId, start, end);
    }
    
    // Data statistics and analytics
    public Map<String, Object> getDataStats() {
        try {
            long totalRecords = dataRecordRepository.count();
            long recentRecords = dataRecordRepository.countRecentData(LocalDateTime.now().minusHours(24));
            List<String> sources = dataRecordRepository.findDistinctSourceIds();
            List<String> dataTypes = dataRecordRepository.findDistinctDataTypes();
            
            return Map.of(
                "totalRecords", totalRecords,
                "recentRecords24h", recentRecords,
                "activeSources", sources.size(),
                "dataTypes", dataTypes.size(),
                "sourceIds", sources,
                "availableDataTypes", dataTypes
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to get data statistics: " + e.getMessage());
        }
    }
    
    // Data cleanup and maintenance
    @Transactional
    public long cleanupOldData(int daysOld) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysOld);
        List<DataRecord> oldRecords = dataRecordRepository.findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime.of(2000, 1, 1, 0, 0), cutoff);
        
        long deletedCount = oldRecords.size();
        dataRecordRepository.deleteByTimestampBefore(cutoff);
        
        return deletedCount;
    }
    
    @Transactional
    public void deleteSourceData(String sourceId) {
        dataRecordRepository.deleteBySourceId(sourceId);
    }
    
    // Export data to different formats
    public String exportToJson(List<DataRecord> records) {
        try {
            return objectMapper.writeValueAsString(records);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export to JSON: " + e.getMessage());
        }
    }
    
    public String exportToCsv(List<DataRecord> records) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Source ID,Data Type,Payload,Timestamp,Metadata\n");
        
        for (DataRecord record : records) {
            csv.append(record.getId()).append(",")
               .append("\"").append(escapeCsv(record.getSourceId())).append("\",")
               .append("\"").append(escapeCsv(record.getDataType())).append("\",")
               .append("\"").append(escapeCsv(record.getPayload())).append("\",")
               .append(record.getTimestamp()).append(",")
               .append(record.getMetadata() != null ? "\"" + escapeCsv(record.getMetadata()) + "\"" : "")
               .append("\n");
        }
        
        return csv.toString();
    }
    
    // Helper method to escape CSV values
    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
    
    // Store to external storage systems (cloud, databases, etc.)
    private void storeToExternalStorage(StorageConfig storageConfig, DataRecord record) {
        try {
            switch (storageConfig.getStorageType()) {
                case AWS_S3:
                    storeToS3(storageConfig, record);
                    break;
                case GOOGLE_CLOUD_STORAGE:
                    storeToGoogleCloud(storageConfig, record);
                    break;
                case AZURE_BLOB_STORAGE:
                    storeToAzureBlob(storageConfig, record);
                    break;
                case POSTGRESQL:
                case MSSQL:
                    storeToExternalDatabase(storageConfig, record);
                    break;
                case LOCAL_FILE_SYSTEM:
                    storeToLocalFiles(storageConfig, record);
                    break;
                default:
                    System.out.println("External storage not implemented for: " + storageConfig.getStorageType());
            }
        } catch (Exception e) {
            System.err.println("Failed to store to external storage: " + e.getMessage());
            // Don't fail the main operation, just log the error
        }
    }
    
    private void storeToS3(StorageConfig config, DataRecord record) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config.getConfiguration(), mapTypeRef);
            
            String bucketName = (String) configMap.get("bucketName");
            String region = (String) configMap.get("region");
            String accessKeyId = (String) configMap.get("accessKeyId");
            String secretAccessKey = (String) configMap.get("secretAccessKey");
            
            // Validate required fields
            if (bucketName == null || region == null || accessKeyId == null || secretAccessKey == null) {
                throw new RuntimeException("Missing required AWS S3 configuration");
            }
            
            // Create S3 object key with date-based partitioning
            String objectKey = String.format("data/%s/%s/%d_%s.json",
                record.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")),
                record.getSourceId(),
                record.getId(),
                record.getDataType()
            );
            
            // For production implementation, use AWS SDK:
            /*
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(region)
                .withCredentials(new AWSStaticCredentialsProvider(
                    new BasicAWSCredentials(accessKeyId, secretAccessKey)))
                .build();
            
            String jsonContent = objectMapper.writeValueAsString(record);
            s3Client.putObject(bucketName, objectKey, jsonContent);
            */
            
            System.out.println("AWS S3: Would store record " + record.getId() + " to bucket: " + bucketName + ", key: " + objectKey);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to store to AWS S3: " + e.getMessage());
        }
    }
    
    private void storeToGoogleCloud(StorageConfig config, DataRecord record) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config.getConfiguration(), mapTypeRef);
            
            String bucketName = (String) configMap.get("bucketName");
            String projectId = (String) configMap.get("projectId");
            String privateKey = (String) configMap.get("privateKey");
            String clientEmail = (String) configMap.get("clientEmail");
            
            // Validate required fields
            if (bucketName == null || projectId == null || privateKey == null || clientEmail == null) {
                throw new RuntimeException("Missing required Google Cloud Storage configuration");
            }
            
            // Create blob name with date-based partitioning
            String blobName = String.format("data/%s/%s/%d_%s.json",
                record.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")),
                record.getSourceId(),
                record.getId(),
                record.getDataType()
            );
            
            // For production implementation, use Google Cloud SDK:
            /*
            GoogleCredentials credentials = ServiceAccountCredentials.fromStream(
                new ByteArrayInputStream(serviceAccountJson.getBytes()));
            Storage storage = StorageOptions.newBuilder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build()
                .getService();
            
            String jsonContent = objectMapper.writeValueAsString(record);
            BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, blobName).build();
            storage.create(blobInfo, jsonContent.getBytes());
            */
            
            System.out.println("Google Cloud Storage: Would store record " + record.getId() + " to bucket: " + bucketName + ", blob: " + blobName);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to store to Google Cloud Storage: " + e.getMessage());
        }
    }
    
    private void storeToAzureBlob(StorageConfig config, DataRecord record) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config.getConfiguration(), mapTypeRef);
            
            String containerName = (String) configMap.get("containerName");
            String connectionString = (String) configMap.get("connectionString");
            
            // Validate required fields
            if (containerName == null || connectionString == null) {
                throw new RuntimeException("Missing required Azure Blob Storage configuration");
            }
            
            // Create blob name with date-based partitioning
            String blobName = String.format("data/%s/%s/%d_%s.json",
                record.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")),
                record.getSourceId(),
                record.getId(),
                record.getDataType()
            );
            
            // For production implementation, use Azure SDK:
            /*
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
            BlobClient blobClient = containerClient.getBlobClient(blobName);
            
            String jsonContent = objectMapper.writeValueAsString(record);
            blobClient.upload(BinaryData.fromString(jsonContent), true);
            */
            
            System.out.println("Azure Blob Storage: Would store record " + record.getId() + " to container: " + containerName + ", blob: " + blobName);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to store to Azure Blob Storage: " + e.getMessage());
        }
    }
    
    private void storeToExternalDatabase(StorageConfig config, DataRecord record) {
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            Map<String, Object> configMap = objectMapper.readValue(config.getConfiguration(), mapTypeRef);
            
            String host = (String) configMap.get("host");
            Object portObj = configMap.get("port");
            int port = portObj instanceof Integer ? (Integer) portObj : Integer.parseInt(portObj.toString());
            String database = (String) configMap.get("database");
            String user = (String) configMap.get("user");
            String password = (String) configMap.get("password");
            
            // Validate required fields
            if (host == null || database == null || user == null || password == null) {
                throw new RuntimeException("Missing required database configuration");
            }
            
            // Build connection URL based on storage type
            String url;
            if (config.getStorageType() == StorageConfig.StorageType.POSTGRESQL) {
                url = String.format("jdbc:postgresql://%s:%d/%s", host, port, database);
            } else if (config.getStorageType() == StorageConfig.StorageType.MSSQL) {
                url = String.format("jdbc:sqlserver://%s:%d;databaseName=%s", host, port, database);
            } else {
                throw new RuntimeException("Unsupported database type: " + config.getStorageType());
            }
            
            conn = DriverManager.getConnection(url, user, password);
            
            // Create table if it doesn't exist
            createExternalDataTable(conn, config.getStorageType());
            
            // Insert record
            String insertSql = "INSERT INTO quill_data_records (source_id, data_type, payload, timestamp, metadata, storage_config_id) VALUES (?, ?, ?, ?, ?, ?)";
            stmt = conn.prepareStatement(insertSql);
            stmt.setString(1, record.getSourceId());
            stmt.setString(2, record.getDataType());
            stmt.setString(3, record.getPayload());
            stmt.setTimestamp(4, java.sql.Timestamp.valueOf(record.getTimestamp()));
            stmt.setString(5, record.getMetadata());
            stmt.setLong(6, record.getStorageConfigId());
            
            int rowsAffected = stmt.executeUpdate();
            
            System.out.println("External Database: Stored record " + record.getId() + " to " + config.getStorageType() + 
                             " database (" + rowsAffected + " rows affected)");
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to store to external database: " + e.getMessage());
        } finally {
            try {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                System.err.println("Error closing database connection: " + e.getMessage());
            }
        }
    }
    
    private void createExternalDataTable(Connection conn, StorageConfig.StorageType dbType) throws Exception {
        String createTableSql;
        
        if (dbType == StorageConfig.StorageType.POSTGRESQL) {
            createTableSql = """
                CREATE TABLE IF NOT EXISTS quill_data_records (
                    id BIGSERIAL PRIMARY KEY,
                    source_id VARCHAR(255) NOT NULL,
                    data_type VARCHAR(255) NOT NULL,
                    payload TEXT,
                    timestamp TIMESTAMP NOT NULL,
                    metadata TEXT,
                    storage_config_id BIGINT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_quill_timestamp ON quill_data_records (timestamp);
                CREATE INDEX IF NOT EXISTS idx_quill_source_timestamp ON quill_data_records (source_id, timestamp);
                """;
        } else if (dbType == StorageConfig.StorageType.MSSQL) {
            createTableSql = """
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='quill_data_records' AND xtype='U')
                CREATE TABLE quill_data_records (
                    id BIGINT IDENTITY(1,1) PRIMARY KEY,
                    source_id NVARCHAR(255) NOT NULL,
                    data_type NVARCHAR(255) NOT NULL,
                    payload NTEXT,
                    timestamp DATETIME2 NOT NULL,
                    metadata NTEXT,
                    storage_config_id BIGINT,
                    created_at DATETIME2 DEFAULT GETDATE()
                );
                """;
        } else {
            throw new RuntimeException("Unsupported database type for table creation: " + dbType);
        }
        
        try (Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSql);
        }
    }
    
    private void storeToLocalFiles(StorageConfig config, DataRecord record) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config.getConfiguration(), mapTypeRef);
            String basePath = (String) configMap.get("path");
            
            if (basePath == null || basePath.trim().isEmpty()) {
                throw new RuntimeException("Missing local file system path configuration");
            }
            
            // Create directory structure by date and source
            LocalDateTime timestamp = record.getTimestamp();
            String datePath = String.format("%04d/%02d/%02d/%s", 
                timestamp.getYear(), 
                timestamp.getMonthValue(), 
                timestamp.getDayOfMonth(),
                record.getSourceId()
            );
            
            java.io.File directory = new java.io.File(basePath, datePath);
            if (!directory.exists() && !directory.mkdirs()) {
                throw new RuntimeException("Cannot create directory: " + directory.getAbsolutePath());
            }
            
            // Create filename with timestamp and record ID
            String fileName = String.format("%s_%d_%s.json", 
                timestamp.format(DateTimeFormatter.ofPattern("HHmmss")),
                record.getId(),
                record.getDataType().replaceAll("[^a-zA-Z0-9]", "_")
            );
            
            java.io.File file = new java.io.File(directory, fileName);
            
            // Write record as JSON
            String jsonContent = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(record);
            java.nio.file.Files.write(file.toPath(), jsonContent.getBytes());
            
            System.out.println("Local File System: Stored record " + record.getId() + " to: " + file.getAbsolutePath());
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to store to local file system: " + e.getMessage());
        }
    }
}
