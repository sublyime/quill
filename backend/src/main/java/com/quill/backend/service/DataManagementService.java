package com.quill.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quill.backend.model.DataRecord;
import com.quill.backend.model.Storage;
import com.quill.backend.repository.DataRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class DataManagementService {
    private static final Logger logger = LoggerFactory.getLogger(DataManagementService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);
    
    @Autowired
    private StorageService storageService;

    @Autowired
    private DataRecordRepository dataRecordRepository;

    @Autowired
    private S3Client s3Client;

    private final Map<String, StorageWriter> storageWriters = new HashMap<>();

    public DataManagementService() {
        // Initialize storage writers for different storage types
        storageWriters.put("local_db", this::writeToLocalDb);
        storageWriters.put("s3", this::writeToS3);
        storageWriters.put("external_db", this::writeToExternalDb);
    }

    public Map<String, Object> getStorageStatus() {
        Map<String, Object> status = new HashMap<>();
        try {
            Optional<Storage> defaultStorage = storageService.findDefaultStorage();
            if (defaultStorage.isPresent()) {
                Storage storage = defaultStorage.get();
                status.put("configured", true);
                status.put("storageType", storage.getStorageType());
                status.put("storageName", storage.getName());
                status.put("status", storage.getStatus().toString());
                status.put("isActive", storage.getIsActive());
                status.put("lastTested", storage.getLastTestedAt());
            } else {
                status.put("configured", false);
                status.put("message", "No default storage configuration found");
            }
            status.put("totalConfigurations", storageService.getStorageCount());
            status.put("activeConfigurations", storageService.findActiveStorage().size());
        } catch (Exception e) {
            status.put("configured", false);
            status.put("error", e.getMessage());
        }
        return status;
    }

    public Map<String, Object> storeData(Map<String, Object> data, Long storageId) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Storage> targetStorages = new ArrayList<>();
            
            // Add specified storage if provided
            if (storageId != null) {
                targetStorages.add(storageService.findById(storageId)
                    .orElseThrow(() -> new RuntimeException("Storage with ID " + storageId + " not found")));
            }
            
            // Always include default storage
            Storage defaultStorage = storageService.getDefaultStorageOrThrow();
            if (targetStorages.isEmpty() || !targetStorages.get(0).getId().equals(defaultStorage.getId())) {
                targetStorages.add(defaultStorage);
            }

            DataRecord record = new DataRecord();
            record.setSourceId((String) data.getOrDefault("sourceId", "unknown"));
            record.setDataType((String) data.getOrDefault("dataType", "generic"));
            record.setTimestamp(LocalDateTime.now());
            record.setContent(objectMapper.writeValueAsString(data));
            record.setStatus(DataRecord.DataStatus.RECEIVED);

            // Store to all target storages
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            for (Storage storage : targetStorages) {
                record.setStorage(storage);
                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        StorageWriter writer = getStorageWriter(storage.getStorageType());
                        writer.write(record, storage);
                    } catch (Exception e) {
                        logger.error("Failed to write to storage {}: {}", storage.getId(), e.getMessage(), e);
                        throw new RuntimeException("Storage write failed", e);
                    }
                }, executorService));
            }

            // Wait for all writes to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            result.put("success", true);
            result.put("message", "Data stored successfully");
            result.put("recordId", record.getId());

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    public Map<String, Object> storeDataBatch(List<DataRecord> dataRecords) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Storage> activeStorages = storageService.findActiveStorage();
            if (activeStorages.isEmpty()) {
                activeStorages = List.of(storageService.getDefaultStorageOrThrow());
            }

            List<CompletableFuture<Void>> futures = new ArrayList<>();

            // For each storage destination
            for (Storage storage : activeStorages) {
                // Process each record for this storage
                List<DataRecord> storageRecords = dataRecords.stream()
                    .map(record -> {
                        DataRecord copy = new DataRecord();
                        copy.setSourceId(record.getSourceId());
                        copy.setDataType(record.getDataType());
                        copy.setContent(record.getContent());
                        copy.setTimestamp(LocalDateTime.now());
                        copy.setStatus(DataRecord.DataStatus.RECEIVED);
                        copy.setStorage(storage);
                        return copy;
                    })
                    .toList();

                // Write records to this storage asynchronously
                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        StorageWriter writer = getStorageWriter(storage.getStorageType());
                        for (DataRecord record : storageRecords) {
                            writer.write(record, storage);
                        }
                    } catch (Exception e) {
                        logger.error("Failed to write batch to storage {}: {}", 
                            storage.getId(), e.getMessage(), e);
                        throw new RuntimeException("Storage write failed", e);
                    }
                }, executorService));
            }

            // Wait for all writes to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            result.put("success", true);
            result.put("message", "Batch of " + dataRecords.size() + " records stored successfully.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            logger.error("Batch storage failed: {}", e.getMessage(), e);
        }
        return result;
    }

    private StorageWriter getStorageWriter(String storageType) {
        StorageWriter writer = storageWriters.get(storageType.toLowerCase());
        if (writer == null) {
            throw new IllegalArgumentException("Unsupported storage type: " + storageType);
        }
        return writer;
    }

    private void writeToLocalDb(DataRecord record, Storage storage) throws Exception {
        // Always save to local DB for data access
        dataRecordRepository.save(record);
    }

    private void writeToS3(DataRecord record, Storage storage) throws Exception {
        String bucket = storage.getConfigurationValue("bucket");
        String prefix = storage.getConfigurationValue("prefix");
        
        // Generate S3 key using source and timestamp
        String key = String.format("%s/%s/%s/%s.json",
            prefix,
            record.getSourceId(),
            record.getTimestamp().format(DateTimeFormatter.ISO_DATE),
            record.getTimestamp().format(DateTimeFormatter.ISO_TIME));

        // Upload to S3
        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .build();

        s3Client.putObject(request, 
            RequestBody.fromBytes(record.getContent().getBytes()));
    }

    private void writeToExternalDb(DataRecord record, Storage storage) throws Exception {
        String url = storage.getConfigurationValue("url");
        String username = storage.getConfigurationValue("username");
        String password = storage.getConfigurationValue("password");
        String table = storage.getConfigurationValue("table");

        try (java.sql.Connection conn = DriverManager.getConnection(url, username, password)) {
            String sql = String.format(
                "INSERT INTO %s (source_id, data_type, content, timestamp) VALUES (?, ?, ?, ?)",
                table
            );
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, record.getSourceId());
                stmt.setString(2, record.getDataType());
                stmt.setString(3, record.getContent());
                stmt.setTimestamp(4, java.sql.Timestamp.valueOf(record.getTimestamp()));
                stmt.executeUpdate();
            }
        }
    }

    public List<DataRecord> getDataBySource(String sourceId) {
        return dataRecordRepository.findBySourceIdOrderByTimestampDesc(sourceId);
    }

    public List<DataRecord> getDataByType(String dataType) {
        return dataRecordRepository.findByDataTypeOrderByTimestampDesc(dataType);
    }

    public List<DataRecord> getRecentData(int limit) {
        return dataRecordRepository.findTopByOrderByTimestampDesc(limit);
    }

    public List<DataRecord> getDataByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        return dataRecordRepository.findByTimestampBetweenOrderByTimestampDesc(startTime, endTime);
    }

    public Map<String, Object> getDataStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecords", dataRecordRepository.count());
        stats.put("recordsToday", dataRecordRepository.countByTimestampAfter(LocalDateTime.now().minusDays(1)));
        stats.put("recordsWithErrors", dataRecordRepository.countByStatus(DataRecord.DataStatus.ERROR));
        return stats;
    }

    public String exportToJson(List<DataRecord> data) throws JsonProcessingException {
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
    }

    public String exportToCsv(List<DataRecord> data) {
        if (data == null || data.isEmpty()) {
            return "";
        }
        StringBuilder csv = new StringBuilder("id,sourceId,dataType,timestamp,content\n");
        for (DataRecord record : data) {
            csv.append(record.getId()).append(",")
               .append(record.getSourceId()).append(",")
               .append(record.getDataType()).append(",")
               .append(record.getTimestamp()).append(",")
               .append("\"" + record.getContent().replace("\"", "\"\"") + "\"\n");
        }
        return csv.toString();
    }

    public Map<String, Object> cleanupOldData(int daysOld) {
        Map<String, Object> result = new HashMap<>();
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(daysOld);
            List<DataRecord> oldRecords = dataRecordRepository.findByTimestampBefore(cutoff);
            dataRecordRepository.deleteAll(oldRecords);
            result.put("success", true);
            result.put("message", "Deleted " + oldRecords.size() + " records older than " + daysOld + " days.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
    
    public Map<String, Object> storeData(Map<String, Object> data) {
        return storeData(data, null);
    }

    public List<Map<String, Object>> getStoredData(Map<String, String> filters) {
        // This method's implementation is tied to the local file system storage and remains a placeholder
        return new ArrayList<>();
    }
}
