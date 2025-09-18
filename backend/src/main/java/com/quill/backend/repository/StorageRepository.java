package com.quill.backend.repository;

import com.quill.backend.model.Storage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StorageRepository extends JpaRepository<Storage, Long> {
    Optional<Storage> findByIsDefaultTrue();
    boolean existsByName(String name);
}
