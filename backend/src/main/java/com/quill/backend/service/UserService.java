package com.quill.backend.service;

import com.quill.backend.model.User;
import com.quill.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Basic CRUD Operations
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User save(User user) {
        // Set default roles if none provided
        if (user.getRoles().isEmpty()) {
            user.getRoles().add(User.UserRole.VIEWER);
        }
        
        // Set default permissions based on roles
        updatePermissionsFromRoles(user);
        
        return userRepository.save(user);
    }
    
    public User update(Long id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Update fields
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setPhone(updatedUser.getPhone());
            user.setDepartment(updatedUser.getDepartment());
            user.setJobTitle(updatedUser.getJobTitle());
            user.setAvatarUrl(updatedUser.getAvatarUrl());
            user.setStatus(updatedUser.getStatus());
            user.setRoles(updatedUser.getRoles());
            user.setPermissions(updatedUser.getPermissions());
            
            updatePermissionsFromRoles(user);
            
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + id);
    }
    
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // Search and Filter
    public List<User> findByStatus(User.UserStatus status) {
        return userRepository.findByStatus(status);
    }
    
    public List<User> findByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public List<User> searchUsers(String searchTerm) {
        return userRepository.findBySearchTerm(searchTerm);
    }
    
    // Permission Management
    public User assignRole(Long userId, User.UserRole role) {
        User user = findById(userId).orElseThrow();
        user.getRoles().add(role);
        updatePermissionsFromRoles(user);
        return userRepository.save(user);
    }
    
    public User removeRole(Long userId, User.UserRole role) {
        User user = findById(userId).orElseThrow();
        user.getRoles().remove(role);
        updatePermissionsFromRoles(user);
        return userRepository.save(user);
    }
    
    public User assignPermission(Long userId, User.Permission permission) {
        User user = findById(userId).orElseThrow();
        user.getPermissions().add(permission);
        return userRepository.save(user);
    }
    
    public User removePermission(Long userId, User.Permission permission) {
        User user = findById(userId).orElseThrow();
        user.getPermissions().remove(permission);
        return userRepository.save(user);
    }
    
    // Update last login
    public void updateLastLogin(Long userId) {
        User user = findById(userId).orElseThrow();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    // Statistics
    public long getTotalUsers() {
        return userRepository.count();
    }
    
    public long getActiveUsers() {
        return userRepository.countByStatus(User.UserStatus.ACTIVE);
    }
    
    // Helper method to set permissions based on roles
    private void updatePermissionsFromRoles(User user) {
        Set<User.Permission> permissions = user.getPermissions();
        
        for (User.UserRole role : user.getRoles()) {
            switch (role) {
                case ADMIN:
                    // Admins get all permissions
                    permissions.addAll(List.of(User.Permission.values()));
                    break;
                case MANAGER:
                    permissions.addAll(List.of(
                        User.Permission.VIEW_CONNECTIONS, User.Permission.CREATE_CONNECTIONS,
                        User.Permission.EDIT_CONNECTIONS, User.Permission.DELETE_CONNECTIONS,
                        User.Permission.VIEW_DATA, User.Permission.EXPORT_DATA,
                        User.Permission.VIEW_USERS, User.Permission.CREATE_USERS, User.Permission.EDIT_USERS,
                        User.Permission.VIEW_REPORTS, User.Permission.CREATE_REPORTS,
                        User.Permission.EDIT_REPORTS, User.Permission.EXPORT_REPORTS
                    ));
                    break;
                case EDITOR:
                    permissions.addAll(List.of(
                        User.Permission.VIEW_CONNECTIONS, User.Permission.CREATE_CONNECTIONS,
                        User.Permission.EDIT_CONNECTIONS,
                        User.Permission.VIEW_DATA, User.Permission.EXPORT_DATA,
                        User.Permission.VIEW_REPORTS, User.Permission.CREATE_REPORTS,
                        User.Permission.EDIT_REPORTS
                    ));
                    break;
                case ANALYST:
                    permissions.addAll(List.of(
                        User.Permission.VIEW_CONNECTIONS, User.Permission.VIEW_DATA,
                        User.Permission.EXPORT_DATA, User.Permission.VIEW_REPORTS,
                        User.Permission.CREATE_REPORTS, User.Permission.EXPORT_REPORTS,
                        User.Permission.VIEW_ANALYTICS
                    ));
                    break;
                case TECHNICIAN:
                    permissions.addAll(List.of(
                        User.Permission.VIEW_CONNECTIONS, User.Permission.CREATE_CONNECTIONS,
                        User.Permission.EDIT_CONNECTIONS, User.Permission.VIEW_DATA
                    ));
                    break;
                case VIEWER:
                    permissions.addAll(List.of(
                        User.Permission.VIEW_CONNECTIONS, User.Permission.VIEW_DATA,
                        User.Permission.VIEW_REPORTS
                    ));
                    break;
            }
        }
    }
}
