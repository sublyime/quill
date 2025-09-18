package com.quill.backend.repository;

import com.quill.backend.model.DataRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DataRecordRepository extends JpaRepository<DataRecord, Long> {
    
    List<DataRecord> findBySourceIdOrderByTimestampDesc(String sourceId);
    
    List<DataRecord> findByDataTypeOrderByTimestampDesc(String dataType);
    
    @Query("SELECT d FROM DataRecord d ORDER BY d.timestamp DESC LIMIT ?1")
    List<DataRecord> findTopByOrderByTimestampDesc(int limit);
    
    List<DataRecord> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime startTime, LocalDateTime endTime);
    
    List<DataRecord> findByTimestampBefore(LocalDateTime cutoffDate);
    
    long countByTimestampAfter(LocalDateTime timestamp);
    
    long countByStatus(DataRecord.DataStatus status);
}
