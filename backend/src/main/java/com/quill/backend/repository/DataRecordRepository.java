package com.quill.backend.repository;

import com.quill.backend.model.DataRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DataRecordRepository extends JpaRepository<DataRecord, Long> {
    
    List<DataRecord> findBySourceIdOrderByTimestampDesc(String sourceId);
    
    List<DataRecord> findByDataTypeOrderByTimestampDesc(String dataType);
    
    List<DataRecord> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
    
    List<DataRecord> findBySourceIdAndTimestampBetweenOrderByTimestampDesc(
        String sourceId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT d FROM DataRecord d WHERE d.timestamp >= :since ORDER BY d.timestamp DESC")
    List<DataRecord> findRecentData(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(d) FROM DataRecord d WHERE d.sourceId = :sourceId")
    long countBySourceId(@Param("sourceId") String sourceId);
    
    @Query("SELECT COUNT(d) FROM DataRecord d WHERE d.timestamp >= :since")
    long countRecentData(@Param("since") LocalDateTime since);
    
    @Query("SELECT DISTINCT d.sourceId FROM DataRecord d")
    List<String> findDistinctSourceIds();
    
    @Query("SELECT DISTINCT d.dataType FROM DataRecord d")
    List<String> findDistinctDataTypes();
    
    void deleteByTimestampBefore(LocalDateTime cutoff);
    
    void deleteBySourceId(String sourceId);
}
