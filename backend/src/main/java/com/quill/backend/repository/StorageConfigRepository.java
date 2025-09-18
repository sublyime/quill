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
    
    @Query("SELECT COUNT(s) FROM StorageConfig s WHERE s.isActive = true")
    long countByIsActiveTrue();
    
    @Query("SELECT s FROM StorageConfig s ORDER BY s.isDefault DESC, s.isActive DESC, s.createdAt DESC")
    List<StorageConfig> findAllOrderedByPriority();
}
