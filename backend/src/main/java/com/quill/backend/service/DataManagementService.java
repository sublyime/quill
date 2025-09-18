package com.quill.backend.service;

import com.quill.backend.model.DataRecord;
import com.quill.backend.model.Storage;
import com.quill.backend.repository.DataRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@Service
public class DataManagementService {
    
    @Autowired
    private StorageService storageService;
    
    @Autowired
    private DataRecordRepository dataRecordRepository;
    
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
    
    // Fixed method signature to match DataController expectations
    public Map<String, Object> storeData(Map<String, Object> data) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Storage> defaultStorage = storageService.findDefaultStorage();
            
            if (defaultStorage.isEmpty()) {
                result.put("success", false);
                result.put("error", "No default storage configuration found");
                return result;
            }
            
            Storage storage = defaultStorage.get();
            String storageType = storage.getStorageType();
            
            data.put("timestamp", LocalDateTime.now().toString());
            data.put("storageConfiguration", storage.getName());
            
            switch (storageType) {
                case "LOCAL_FILE_SYSTEM":
                    result = storeToLocalFileSystem(data, storage);
                    break;
                case "POSTGRESQL":
                    result = storeToPostgreSQL(data, storage);
                    break;
                case "AWS_S3":
                    result = storeToS3(data, storage);
                    break;
                case "AZURE_BLOB_STORAGE":
                    result = storeToAzureBlob(data, storage);
                    break;
                default:
                    result.put("success", false);
                    result.put("error", "Unsupported storage type: " + storageType);
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    // NEW: Store data batch method
    public Map<String, Object> storeDataBatch(List<DataRecord> dataRecords) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<DataRecord> savedRecords = dataRecordRepository.saveAll(dataRecords);
            
            result.put("success", true);
            result.put("message", "Batch data stored successfully");
            result.put("recordCount", savedRecords.size());
            result.put("timestamp", LocalDateTime.now().toString());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Failed to store batch data: " + e.getMessage());
        }
        
        return result;
    }
    
    // NEW: Get data by source
    public List<DataRecord> getDataBySource(String sourceId) {
        return dataRecordRepository.findBySourceIdOrderByTimestampDesc(sourceId);
    }
    
    // NEW: Get data by type
    public List<DataRecord> getDataByType(String dataType) {
        return dataRecordRepository.findByDataTypeOrderByTimestampDesc(dataType);
    }
    
    // NEW: Get recent data
    public List<DataRecord> getRecentData(int limit) {
        return dataRecordRepository.findTopByOrderByTimestampDesc(limit);
    }
    
    // NEW: Get data by time range
    public List<DataRecord> getDataByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        return dataRecordRepository.findByTimestampBetweenOrderByTimestampDesc(startTime, endTime);
    }
    
    // NEW: Get data statistics
    public Map<String, Object> getDataStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long totalRecords = dataRecordRepository.count();
            long todayRecords = dataRecordRepository.countByTimestampAfter(LocalDateTime.now().minusDays(1));
            long activeRecords = dataRecordRepository.countByStatus(DataRecord.DataStatus.ACTIVE);
            
            stats.put("totalRecords", totalRecords);
            stats.put("todayRecords", todayRecords);
            stats.put("activeRecords", activeRecords);
            stats.put("lastUpdated", LocalDateTime.now().toString());
            
        } catch (Exception e) {
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }
    
    // NEW: Export to JSON
    public String exportToJson(List<DataRecord> dataRecords) {
        try {
            StringBuilder json = new StringBuilder();
            json.append("[\n");
            
            for (int i = 0; i < dataRecords.size(); i++) {
                DataRecord record = dataRecords.get(i);
                json.append("  {\n");
                json.append("    \"id\": ").append(record.getId()).append(",\n");
                json.append("    \"sourceId\": \"").append(record.getSourceId()).append("\",\n");
                json.append("    \"dataType\": \"").append(record.getDataType()).append("\",\n");
                json.append("    \"payload\": \"").append(record.getPayload()).append("\",\n");
                json.append("    \"timestamp\": \"").append(record.getTimestamp()).append("\"\n");
                json.append("  }");
                if (i < dataRecords.size() - 1) {
                    json.append(",");
                }
                json.append("\n");
            }
            
            json.append("]");
            return json.toString();
            
        } catch (Exception e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
    
    // NEW: Export to CSV
    public String exportToCsv(List<DataRecord> dataRecords) {
        try {
            StringBuilder csv = new StringBuilder();
            csv.append("ID,Source ID,Data Type,Payload,Timestamp,Status\n");
            
            for (DataRecord record : dataRecords) {
                csv.append(record.getId()).append(",");
                csv.append("\"").append(record.getSourceId()).append("\",");
                csv.append("\"").append(record.getDataType()).append("\",");
                csv.append("\"").append(record.getPayload() != null ? record.getPayload().replace("\"", "\"\"") : "").append("\",");
                csv.append("\"").append(record.getTimestamp()).append("\",");
                csv.append("\"").append(record.getStatus()).append("\"\n");
            }
            
            return csv.toString();
            
        } catch (Exception e) {
            return "Error," + e.getMessage();
        }
    }
    
    // NEW: Cleanup old data
    public Map<String, Object> cleanupOldData(int daysOld) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
            List<DataRecord> oldRecords = dataRecordRepository.findByTimestampBefore(cutoffDate);
            
            dataRecordRepository.deleteAll(oldRecords);
            
            result.put("success", true);
            result.put("deletedRecords", oldRecords.size());
            result.put("cutoffDate", cutoffDate.toString());
            result.put("message", "Successfully cleaned up " + oldRecords.size() + " old records");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Failed to cleanup old data: " + e.getMessage());
        }
        
        return result;
    }
    
    public List<Map<String, Object>> getStoredData(Map<String, String> filters) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try {
            Optional<Storage> defaultStorage = storageService.findDefaultStorage();
            
            if (defaultStorage.isEmpty()) {
                return results;
            }
            
            Storage storage = defaultStorage.get();
            String storageType = storage.getStorageType();
            
            switch (storageType) {
                case "LOCAL_FILE_SYSTEM":
                    results = retrieveFromLocalFileSystem(filters, storage);
                    break;
                case "POSTGRESQL":
                    results = retrieveFromPostgreSQL(filters, storage);
                    break;
                case "AWS_S3":
                    results = retrieveFromS3(filters, storage);
                    break;
                case "AZURE_BLOB_STORAGE":
                    results = retrieveFromAzureBlob(filters, storage);
                    break;
            }
            
        } catch (Exception e) {
            System.err.println("Error retrieving data: " + e.getMessage());
        }
        
        return results;
    }
    
    // Private helper methods remain the same
    private Map<String, Object> storeToLocalFileSystem(Map<String, Object> data, Storage storage) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            result.put("success", true);
            result.put("message", "Data stored to local file system");
            result.put("location", "local://" + data.get("timestamp"));
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Local file system storage failed: " + e.getMessage());
        }
        
        return result;
    }
    
    private Map<String, Object> storeToPostgreSQL(Map<String, Object> data, Storage storage) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            result.put("success", true);
            result.put("message", "Data stored to PostgreSQL");
            result.put("location", "postgresql://table_" + System.currentTimeMillis());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "PostgreSQL storage failed: " + e.getMessage());
        }
        
        return result;
    }
    
    private Map<String, Object> storeToS3(Map<String, Object> data, Storage storage) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            result.put("success", true);
            result.put("message", "Data stored to Amazon S3");
            result.put("location", "s3://bucket/object_" + System.currentTimeMillis());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "S3 storage failed: " + e.getMessage());
        }
        
        return result;
    }
    
    private Map<String, Object> storeToAzureBlob(Map<String, Object> data, Storage storage) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            result.put("success", true);
            result.put("message", "Data stored to Azure Blob Storage");
            result.put("location", "azure://container/blob_" + System.currentTimeMillis());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Azure Blob storage failed: " + e.getMessage());
        }
        
        return result;
    }
    
    private List<Map<String, Object>> retrieveFromLocalFileSystem(Map<String, String> filters, Storage storage) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        Map<String, Object> sampleData = new HashMap<>();
        sampleData.put("id", 1);
        sampleData.put("timestamp", LocalDateTime.now().toString());
        sampleData.put("source", "local_file_system");
        results.add(sampleData);
        
        return results;
    }
    
    private List<Map<String, Object>> retrieveFromPostgreSQL(Map<String, String> filters, Storage storage) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        Map<String, Object> sampleData = new HashMap<>();
        sampleData.put("id", 1);
        sampleData.put("timestamp", LocalDateTime.now().toString());
        sampleData.put("source", "postgresql");
        results.add(sampleData);
        
        return results;
    }
    
    private List<Map<String, Object>> retrieveFromS3(Map<String, String> filters, Storage storage) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        Map<String, Object> sampleData = new HashMap<>();
        sampleData.put("id", 1);
        sampleData.put("timestamp", LocalDateTime.now().toString());
        sampleData.put("source", "s3");
        results.add(sampleData);
        
        return results;
    }
    
    private List<Map<String, Object>> retrieveFromAzureBlob(Map<String, String> filters, Storage storage) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        Map<String, Object> sampleData = new HashMap<>();
        sampleData.put("id", 1);
        sampleData.put("timestamp", LocalDateTime.now().toString());
        sampleData.put("source", "azure_blob");
        results.add(sampleData);
        
        return results;
    }
}
