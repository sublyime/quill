package com.quill.backend.repository;

import com.quill.backend.model.StorageConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StorageConfigRepository extends JpaRepository<StorageConfig, Long> {
    
    Optional<StorageConfig> findByIsDefaultTrue();
    
    List<StorageConfig> findByIsActiveTrue();
    
    List<StorageConfig> findByStorageType(StorageConfig.StorageType storageType);
    
    List<StorageConfig> findByStatus(StorageConfig.StorageStatus status);
    
    @Query("SELECT s FROM StorageConfig s ORDER BY s.isDefault DESC, s.isActive DESC, s.createdAt DESC")
    List<StorageConfig> findAllOrderedByPriority();
    
    long countByIsActiveTrue();
}
