package com.quill.backend.repository;

import com.quill.backend.model.ModbusReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ModbusReadingRepository extends JpaRepository<ModbusReading, Long> {
    List<ModbusReading> findByConnectionId(Long connectionId);
    
    List<ModbusReading> findByConnectionIdAndRegisterAndRegisterType(
        Long connectionId, Integer register, String registerType);
    
    @Query("SELECT r FROM ModbusReading r WHERE r.connection.id = :connectionId " +
           "AND r.readAt BETWEEN :startTime AND :endTime")
    List<ModbusReading> findReadingsInTimeRange(
        @Param("connectionId") Long connectionId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT r FROM ModbusReading r WHERE r.connection.id = :connectionId " +
           "AND r.register = :register AND r.registerType = :registerType " +
           "ORDER BY r.readAt DESC LIMIT 1")
    ModbusReading findLatestReading(
        @Param("connectionId") Long connectionId,
        @Param("register") Integer register,
        @Param("registerType") String registerType);
}