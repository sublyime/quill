package com.quill.backend.controller;

import com.quill.backend.model.DataRecord;
import com.quill.backend.service.DataManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = {"http://localhost:9002", "http://localhost:3000"})
public class DataController {
    
    @Autowired
    private DataManagementService dataManagementService;
    
    // Store single data record
    @PostMapping("/store")
    public ResponseEntity<DataRecord> storeData(@RequestBody DataStoreRequest request) {
        try {
            System.out.println("=== POST /api/data/store called ===");
            DataRecord record = dataManagementService.storeData(
                request.getSourceId(),
                request.getDataType(),
                request.getPayload(),
                request.getMetadata()
            );
            System.out.println("Stored data record with ID: " + record.getId());
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            System.err.println("Error storing data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Store batch of data records
    @PostMapping("/store/batch")
    public ResponseEntity<List<DataRecord>> storeDataBatch(@RequestBody List<DataRecord> records) {
        try {
            System.out.println("=== POST /api/data/store/batch called ===");
            System.out.println("Storing " + records.size() + " records");
            List<DataRecord> storedRecords = dataManagementService.storeDataBatch(records);
            System.out.println("Successfully stored " + storedRecords.size() + " records");
            return ResponseEntity.ok(storedRecords);
        } catch (Exception e) {
            System.err.println("Error storing data batch: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get data by source
    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<DataRecord>> getDataBySource(@PathVariable String sourceId) {
        try {
            System.out.println("=== GET /api/data/source/" + sourceId + " called ===");
            List<DataRecord> data = dataManagementService.getDataBySource(sourceId);
            System.out.println("Retrieved " + data.size() + " records for source: " + sourceId);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.err.println("Error retrieving data by source: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get data by type
    @GetMapping("/type/{dataType}")
    public ResponseEntity<List<DataRecord>> getDataByType(@PathVariable String dataType) {
        try {
            System.out.println("=== GET /api/data/type/" + dataType + " called ===");
            List<DataRecord> data = dataManagementService.getDataByType(dataType);
            System.out.println("Retrieved " + data.size() + " records for type: " + dataType);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.err.println("Error retrieving data by type: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get recent data (last N hours)
    @GetMapping("/recent")
    public ResponseEntity<List<DataRecord>> getRecentData(@RequestParam(defaultValue = "24") int hours) {
        try {
            System.out.println("=== GET /api/data/recent?hours=" + hours + " called ===");
            List<DataRecord> data = dataManagementService.getRecentData(hours);
            System.out.println("Retrieved " + data.size() + " recent records");
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.err.println("Error retrieving recent data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get data by time range
    @GetMapping("/range")
    public ResponseEntity<List<DataRecord>> getDataByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            System.out.println("=== GET /api/data/range called ===");
            System.out.println("Date range: " + start + " to " + end);
            List<DataRecord> data = dataManagementService.getDataByTimeRange(start, end);
            System.out.println("Retrieved " + data.size() + " records in range");
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.err.println("Error retrieving data by range: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get data statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDataStats() {
        try {
            System.out.println("=== GET /api/data/stats called ===");
            Map<String, Object> stats = dataManagementService.getDataStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error retrieving data stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Export data
    @GetMapping("/export/json")
    public ResponseEntity<String> exportToJson(
            @RequestParam(required = false) String sourceId,
            @RequestParam(required = false) String dataType,
            @RequestParam(defaultValue = "24") int hours) {
        try {
            System.out.println("=== GET /api/data/export/json called ===");
            List<DataRecord> data;
            
            if (sourceId != null) {
                data = dataManagementService.getDataBySource(sourceId);
            } else if (dataType != null) {
                data = dataManagementService.getDataByType(dataType);
            } else {
                data = dataManagementService.getRecentData(hours);
            }
            
            String json = dataManagementService.exportToJson(data);
            System.out.println("Exported " + data.size() + " records to JSON");
            
            return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .header("Content-Disposition", "attachment; filename=data_export.json")
                .body(json);
        } catch (Exception e) {
            System.err.println("Error exporting to JSON: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCsv(
            @RequestParam(required = false) String sourceId,
            @RequestParam(required = false) String dataType,
            @RequestParam(defaultValue = "24") int hours) {
        try {
            System.out.println("=== GET /api/data/export/csv called ===");
            List<DataRecord> data;
            
            if (sourceId != null) {
                data = dataManagementService.getDataBySource(sourceId);
            } else if (dataType != null) {
                data = dataManagementService.getDataByType(dataType);
            } else {
                data = dataManagementService.getRecentData(hours);
            }
            
            String csv = dataManagementService.exportToCsv(data);
            System.out.println("Exported " + data.size() + " records to CSV");
            
            return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=data_export.csv")
                .body(csv);
        } catch (Exception e) {
            System.err.println("Error exporting to CSV: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Data cleanup
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldData(@RequestParam(defaultValue = "30") int daysOld) {
        try {
            System.out.println("=== DELETE /api/data/cleanup called ===");
            long deletedCount = dataManagementService.cleanupOldData(daysOld);
            System.out.println("Deleted " + deletedCount + " old records");
            
            return ResponseEntity.ok(Map.of(
                "deletedRecords", deletedCount,
                "message", "Successfully cleaned up data older than " + daysOld + " days"
            ));
        } catch (Exception e) {
            System.err.println("Error cleaning up data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Request DTOs
    public static class DataStoreRequest {
        private String sourceId;
        private String dataType;
        private Object payload;
        private Map<String, Object> metadata;
        
        // Getters and setters
        public String getSourceId() { return sourceId; }
        public void setSourceId(String sourceId) { this.sourceId = sourceId; }
        
        public String getDataType() { return dataType; }
        public void setDataType(String dataType) { this.dataType = dataType; }
        
        public Object getPayload() { return payload; }
        public void setPayload(Object payload) { this.payload = payload; }
        
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }
}
