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
    
    // Create new user
    public User createUser(String username, String email, String password, String firstName, String lastName, User.UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // In production, hash this password
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        // Set role
        Set<User.UserRole> roles = new HashSet<>();
        roles.add(role != null ? role : User.UserRole.VIEWER);
        user.setRoles(roles);
        
        // Set permissions based on role
        Set<User.Permission> permissions = new HashSet<>();
        User.UserRole effectiveRole = (role != null) ? role : User.UserRole.VIEWER;
        
        // Always add READ permission
        permissions.add(User.Permission.READ);
        
        switch (effectiveRole) {
            case ADMIN:
                permissions.add(User.Permission.WRITE);
                permissions.add(User.Permission.DELETE);
                permissions.add(User.Permission.ADMIN);
                permissions.add(User.Permission.MANAGE_USERS);
                permissions.add(User.Permission.MANAGE_STORAGE);
                permissions.add(User.Permission.MANAGE_CONNECTIONS);
                break;
            case MANAGER:
                permissions.add(User.Permission.WRITE);
                permissions.add(User.Permission.MANAGE_USERS);
                permissions.add(User.Permission.MANAGE_STORAGE);
                break;
            case EDITOR:
                permissions.add(User.Permission.WRITE);
                break;
            case ANALYST:
                permissions.add(User.Permission.WRITE);
                break;
            case VIEWER:
                // READ permission already added
                break;
        }
        user.setPermissions(permissions);
        
        return userRepository.save(user);
    }
    
    // Update user
    public User updateUser(Long id, String username, String email, String firstName, String lastName, String phone) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (username != null && !username.trim().isEmpty()) {
            user.setUsername(username);
        }
        if (email != null && !email.trim().isEmpty()) {
            user.setEmail(email);
        }
        if (firstName != null && !firstName.trim().isEmpty()) {
            user.setFirstName(firstName);
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            user.setLastName(lastName);
        }
        if (phone != null && !phone.trim().isEmpty()) {
            user.setPhone(phone);
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Delete a user by their ID
     * @param id The ID of the user to delete
     * @throws RuntimeException if the user is not found
     * @throws IllegalStateException if trying to delete the last admin user
     */
    public void deleteUser(Long id) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        // Check if this is the last admin user
        if (user.getRoles().contains(User.UserRole.ADMIN)) {
            long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(User.UserRole.ADMIN))
                .count();
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last admin user");
            }
        }

        // The cascade delete will handle user_roles and user_permissions
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
    
    // Update user status
    public User updateUserStatus(Long id, User.UserStatus status) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    // Reset password
    public User resetPassword(Long id, String currentPassword, String newPassword) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // In production, you would use a proper password hashing mechanism
        // and compare the hashed passwords
        if (!user.getPassword().equals(currentPassword)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        user.setPassword(newPassword); // In production, hash this password
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    // Force reset password (admin only)
    public User forceResetPassword(Long id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(newPassword); // In production, hash this password
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
    
    // Change user password
    public User changePassword(Long id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(newPassword); // In production, hash this password
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Set default permissions based on role - FIXED: Use correct enum values
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
}
