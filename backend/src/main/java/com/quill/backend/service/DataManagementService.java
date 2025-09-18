package com.quill.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quill.backend.model.DataRecord;
import com.quill.backend.model.Storage;
import com.quill.backend.repository.DataRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DataManagementService {

    @Autowired
    private StorageService storageService;

    @Autowired
    private DataRecordRepository dataRecordRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
            Storage storage;
            if (storageId != null) {
                storage = storageService.findById(storageId)
                        .orElseThrow(() -> new RuntimeException("Storage with ID " + storageId + " not found"));
            } else {
                storage = storageService.getDefaultStorageOrThrow();
            }

            DataRecord record = new DataRecord();
            record.setSourceId((String) data.getOrDefault("sourceId", "unknown"));
            record.setDataType((String) data.getOrDefault("dataType", "generic"));
            record.setTimestamp(LocalDateTime.now());
            record.setContent(objectMapper.writeValueAsString(data));
            record.setStatus(DataRecord.DataStatus.RECEIVED);
            record.setStorage(storage);

            dataRecordRepository.save(record);

            result.put("success", true);
            result.put("message", "Data stored successfully with ID: " + record.getId());
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
            Storage storage = storageService.getDefaultStorageOrThrow();
            dataRecords.forEach(record -> {
                record.setTimestamp(LocalDateTime.now());
                record.setStatus(DataRecord.DataStatus.RECEIVED);
                record.setStorage(storage);
            });
            dataRecordRepository.saveAll(dataRecords);
            result.put("success", true);
            result.put("message", "Batch of " + dataRecords.size() + " records stored successfully.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
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
