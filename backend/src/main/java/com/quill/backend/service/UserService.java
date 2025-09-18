package com.quill.backend.service;

import com.quill.backend.model.User;
import com.quill.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Find all users
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    // Find user by ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    // Find user by username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    // Find user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // Check if username exists
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    // Check if email exists
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // Save user (create or update)
    public User save(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Update user
    public User update(Long id, User updatedUser) {
        User existingUser = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setStatus(updatedUser.getStatus());
        existingUser.setRoles(updatedUser.getRoles());
        existingUser.setPermissions(updatedUser.getPermissions());
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(existingUser);
    }
    
    // Delete user by ID
    public void deleteById(Long id) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
    
    // Search users by username or email
    public List<User> searchUsers(String searchTerm) {
        return userRepository.findAll().stream()
                .filter(user -> 
                    user.getUsername().toLowerCase().contains(searchTerm.toLowerCase()) ||
                    user.getEmail().toLowerCase().contains(searchTerm.toLowerCase()) ||
                    (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchTerm.toLowerCase()))
                )
                .toList();
    }
    
    // Find users by status
    public List<User> findByStatus(User.UserStatus status) {
        return userRepository.findAll().stream()
                .filter(user -> user.getStatus() == status)
                .toList();
    }
    
    // Find users by role
    public List<User> findByRole(User.UserRole role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(role))
                .toList();
    }
    
    // Assign role to user
    public User assignRole(Long id, User.UserRole role) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getRoles().add(role);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Assign permission to user
    public User assignPermission(Long id, User.Permission permission) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getPermissions().add(permission);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Get total user count
    public long getTotalUsers() {
        return userRepository.count();
    }
    
    // Get active user count
    public long getActiveUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getStatus() == User.UserStatus.ACTIVE)
                .count();
    }
    
    // Create new user
    public User createUser(String username, String email, String password, String firstName, String lastName) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        // Set default role
        Set<User.UserRole> defaultRoles = new HashSet<>();
        defaultRoles.add(User.UserRole.VIEWER);
        user.setRoles(defaultRoles);
        
        // Set default permissions
        Set<User.Permission> defaultPermissions = new HashSet<>();
        defaultPermissions.add(User.Permission.READ);
        user.setPermissions(defaultPermissions);
        
        return userRepository.save(user);
    }
    
    // Update user
    public User updateUser(Long id, String username, String email, String firstName, String lastName, String phone) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    // Update user status
    public User updateUserStatus(Long id, User.UserStatus status) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Add role to user
    public User addRole(Long id, User.UserRole role) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getRoles().add(role);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Remove role from user
    public User removeRole(Long id, User.UserRole role) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getRoles().remove(role);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Add permission to user
    public User addPermission(Long id, User.Permission permission) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getPermissions().add(permission);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Remove permission from user
    public User removePermission(Long id, User.Permission permission) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getPermissions().remove(permission);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Check if user has role
    public boolean hasRole(Long id, User.UserRole role) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getRoles().contains(role);
    }
    
    // Check if user has permission
    public boolean hasPermission(Long id, User.Permission permission) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getPermissions().contains(permission);
    }
    
    // Delete user
    public void deleteUser(Long id) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
    
    // Find users by role
    public List<User> findUsersByRole(User.UserRole role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(role))
                .toList();
    }
    
    // Find users by status
    public List<User> findUsersByStatus(User.UserStatus status) {
        return userRepository.findAll().stream()
                .filter(user -> user.getStatus() == status)
                .toList();
    }
    
    // Get user count
    public long getUserCount() {
        return userRepository.count();
    }
    
    // Get active user count
    public long getActiveUserCount() {
        return userRepository.findAll().stream()
                .filter(user -> user.getStatus() == User.UserStatus.ACTIVE)
                .count();
    }
    
    // Set default permissions based on role
    public User assignDefaultPermissionsByRole(Long id, User.UserRole role) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        Set<User.Permission> permissions = new HashSet<>();
        
        switch (role) {
            case ADMIN:
                permissions.add(User.Permission.READ);
                permissions.add(User.Permission.WRITE);
                permissions.add(User.Permission.DELETE);
                permissions.add(User.Permission.ADMIN);
                permissions.add(User.Permission.MANAGE_USERS);
                permissions.add(User.Permission.MANAGE_STORAGE);
                permissions.add(User.Permission.MANAGE_CONNECTIONS);
                break;
                
            case MANAGER:
                permissions.add(User.Permission.READ);
                permissions.add(User.Permission.WRITE);
                permissions.add(User.Permission.MANAGE_USERS);
                permissions.add(User.Permission.MANAGE_STORAGE);
                permissions.add(User.Permission.MANAGE_CONNECTIONS);
                break;
                
            case EDITOR:
                permissions.add(User.Permission.READ);
                permissions.add(User.Permission.WRITE);
                permissions.add(User.Permission.MANAGE_CONNECTIONS);
                break;
                
            case ANALYST:
                permissions.add(User.Permission.READ);
                permissions.add(User.Permission.WRITE);
                break;
                
            case VIEWER:
            default:
                permissions.add(User.Permission.READ);
                break;
        }
        
        user.setPermissions(permissions);
        user.getRoles().add(role);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    // Change user password
    public User changePassword(Long id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(newPassword);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Get user profile summary
    public UserProfileSummary getUserProfile(Long id) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileSummary summary = new UserProfileSummary();
        summary.setId(user.getId());
        summary.setUsername(user.getUsername());
        summary.setEmail(user.getEmail());
        summary.setFirstName(user.getFirstName());
        summary.setLastName(user.getLastName());
        summary.setPhone(user.getPhone());
        summary.setStatus(user.getStatus().toString());
        summary.setRoles(user.getRoles().stream().map(Enum::toString).toList());
        summary.setPermissions(user.getPermissions().stream().map(Enum::toString).toList());
        summary.setCreatedAt(user.getCreatedAt());
        summary.setUpdatedAt(user.getUpdatedAt());
        
        return summary;
    }
    
    // Inner class for user profile summary
    public static class UserProfileSummary {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String status;
        private List<String> roles;
        private List<String> permissions;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        
        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}
