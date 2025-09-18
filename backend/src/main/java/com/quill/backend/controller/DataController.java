package com.quill.backend.controller;

import com.quill.backend.model.DataRecord;
import com.quill.backend.service.DataManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "*")
public class DataController {
    
    @Autowired
    private DataManagementService dataManagementService;
    
    // Store single data record
    @PostMapping("/store")
    public ResponseEntity<Map<String, Object>> storeData(@RequestBody Map<String, Object> dataPayload) {
        try {
            // Fixed: Just pass the data payload directly
            Map<String, Object> result = dataManagementService.storeData(dataPayload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }
    
    // Store batch of data records
    @PostMapping("/store-batch")
    public ResponseEntity<Map<String, Object>> storeDataBatch(@RequestBody List<DataRecord> dataRecords) {
        try {
            // Fixed: storeDataBatch returns Map<String, Object>, not List<DataRecord>
            Map<String, Object> result = dataManagementService.storeDataBatch(dataRecords);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }
    
    // Get data by source ID
    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<DataRecord>> getDataBySource(@PathVariable String sourceId) {
        try {
            List<DataRecord> data = dataManagementService.getDataBySource(sourceId);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get data by data type
    @GetMapping("/type/{dataType}")
    public ResponseEntity<List<DataRecord>> getDataByType(@PathVariable String dataType) {
        try {
            List<DataRecord> data = dataManagementService.getDataByType(dataType);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get recent data records
    @GetMapping("/recent")
    public ResponseEntity<List<DataRecord>> getRecentData(@RequestParam(defaultValue = "100") int limit) {
        try {
            List<DataRecord> data = dataManagementService.getRecentData(limit);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get data by time range
    @GetMapping("/range")
    public ResponseEntity<List<DataRecord>> getDataByTimeRange(
            @RequestParam String startTime,
            @RequestParam String endTime) {
        try {
            LocalDateTime start = LocalDateTime.parse(startTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            LocalDateTime end = LocalDateTime.parse(endTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            List<DataRecord> data = dataManagementService.getDataByTimeRange(start, end);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get data statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDataStats() {
        try {
            Map<String, Object> stats = dataManagementService.getDataStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorStats = new HashMap<>();
            errorStats.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorStats);
        }
    }
    
    // Export data as JSON
    @GetMapping("/export/json")
    public ResponseEntity<String> exportDataAsJson(
            @RequestParam(required = false) String sourceId,
            @RequestParam(required = false) String dataType,
            @RequestParam(defaultValue = "1000") int limit) {
        try {
            List<DataRecord> data;
            if (sourceId != null) {
                data = dataManagementService.getDataBySource(sourceId);
            } else if (dataType != null) {
                data = dataManagementService.getDataByType(dataType);
            } else {
                data = dataManagementService.getRecentData(limit);
            }
            
            String jsonResult = dataManagementService.exportToJson(data);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    // Export data as CSV
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportDataAsCsv(
            @RequestParam(required = false) String sourceId,
            @RequestParam(required = false) String dataType,
            @RequestParam(defaultValue = "1000") int limit) {
        try {
            List<DataRecord> data;
            if (sourceId != null) {
                data = dataManagementService.getDataBySource(sourceId);
            } else if (dataType != null) {
                data = dataManagementService.getDataByType(dataType);
            } else {
                data = dataManagementService.getRecentData(limit);
            }
            
            String csvResult = dataManagementService.exportToCsv(data);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .header("Content-Disposition", "attachment; filename=\"data_export.csv\"")
                    .body(csvResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error," + e.getMessage());
        }
    }
    
    // Cleanup old data
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldData(@RequestParam(defaultValue = "30") int daysOld) {
        try {
            // Fixed: cleanupOldData returns Map<String, Object>, not long
            Map<String, Object> result = dataManagementService.cleanupOldData(daysOld);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }
    
    // Get stored data with filters (uses the existing getStoredData method)
    @GetMapping("/stored")
    public ResponseEntity<List<Map<String, Object>>> getStoredData(@RequestParam Map<String, String> filters) {
        try {
            List<Map<String, Object>> data = dataManagementService.getStoredData(filters);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get storage status
    @GetMapping("/storage-status")
    public ResponseEntity<Map<String, Object>> getStorageStatus() {
        try {
            Map<String, Object> status = dataManagementService.getStorageStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorStatus);
        }
    }
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("service", "DataController");
        return ResponseEntity.ok(health);
    }
    
    // Search data records
    @GetMapping("/search")
    public ResponseEntity<List<DataRecord>> searchData(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String sourceId,
            @RequestParam(required = false) String dataType,
            @RequestParam(defaultValue = "100") int limit) {
        try {
            List<DataRecord> data;
            
            if (sourceId != null && !sourceId.isEmpty()) {
                data = dataManagementService.getDataBySource(sourceId);
            } else if (dataType != null && !dataType.isEmpty()) {
                data = dataManagementService.getDataByType(dataType);
            } else {
                data = dataManagementService.getRecentData(limit);
            }
            
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
