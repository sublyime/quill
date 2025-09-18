package com.quill.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password; // In production, this should be hashed
    
    private String firstName;
    private String lastName;
    private String phone;
    private String department;
    private String jobTitle;
    private String avatarUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<UserRole> roles = new HashSet<>();
    
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_permissions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "permission")
    private Set<Permission> permissions = new HashSet<>();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginAt;
    
    // User Status Enum
    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED, PENDING
    }
    
    // User Roles Enum
    public enum UserRole {
        ADMIN, MANAGER, EDITOR, VIEWER, ANALYST, TECHNICIAN
    }
    
    // Permission Enum
    public enum Permission {
        // Data Source Management
        VIEW_CONNECTIONS, CREATE_CONNECTIONS, EDIT_CONNECTIONS, DELETE_CONNECTIONS,
        
        // Data Management
        VIEW_DATA, EXPORT_DATA, IMPORT_DATA, DELETE_DATA,
        
        // User Management
        VIEW_USERS, CREATE_USERS, EDIT_USERS, DELETE_USERS, MANAGE_PERMISSIONS,
        
        // System Management
        VIEW_SYSTEM_LOGS, MANAGE_SYSTEM_SETTINGS, BACKUP_RESTORE, VIEW_ANALYTICS,
        
        // Reports
        VIEW_REPORTS, CREATE_REPORTS, EDIT_REPORTS, DELETE_REPORTS, EXPORT_REPORTS
    }
    
    // Helper methods
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return username;
    }
    
    public boolean hasRole(UserRole role) {
        return roles.contains(role);
    }
    
    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }
    
    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
