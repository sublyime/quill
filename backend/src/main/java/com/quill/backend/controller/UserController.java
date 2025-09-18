package com.quill.backend.controller;

import com.quill.backend.model.User;
import com.quill.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:9002", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            System.out.println("=== GET /api/users called ===");
            List<User> users = userService.findAll();
            System.out.println("Successfully retrieved " + users.size() + " users");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            System.out.println("=== GET /api/users/" + id + " called ===");
            Optional<User> user = userService.findById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in getUserById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Create new user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            System.out.println("=== POST /api/users called ===");
            System.out.println("Creating user: " + user.getUsername());
            
            // Check if username or email already exists
            if (userService.existsByUsername(user.getUsername())) {
                System.err.println("Username already exists: " + user.getUsername());
                return ResponseEntity.badRequest().build();
            }
            
            if (userService.existsByEmail(user.getEmail())) {
                System.err.println("Email already exists: " + user.getEmail());
                return ResponseEntity.badRequest().build();
            }
            
            User savedUser = userService.save(user);
            System.out.println("Successfully created user with ID: " + savedUser.getId());
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            System.err.println("Error in createUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            System.out.println("=== PUT /api/users/" + id + " called ===");
            User updatedUser = userService.update(id, user);
            System.out.println("Successfully updated user with ID: " + id);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            System.err.println("User not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error in updateUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            System.out.println("=== DELETE /api/users/" + id + " called ===");
            if (userService.findById(id).isPresent()) {
                userService.deleteById(id);
                System.out.println("Successfully deleted user with ID: " + id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in deleteUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Search users
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
        try {
            System.out.println("=== GET /api/users/search?q=" + q + " called ===");
            List<User> users = userService.searchUsers(q);
            System.out.println("Found " + users.size() + " users matching: " + q);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error in searchUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get users by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<User>> getUsersByStatus(@PathVariable User.UserStatus status) {
        try {
            System.out.println("=== GET /api/users/status/" + status + " called ===");
            List<User> users = userService.findByStatus(status);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error in getUsersByStatus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable User.UserRole role) {
        try {
            System.out.println("=== GET /api/users/role/" + role + " called ===");
            List<User> users = userService.findByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error in getUsersByRole: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Assign role to user
    @PostMapping("/{id}/roles/{role}")
    public ResponseEntity<User> assignRole(@PathVariable Long id, @PathVariable User.UserRole role) {
        try {
            System.out.println("=== POST /api/users/" + id + "/roles/" + role + " called ===");
            User user = userService.assignRole(id, role);
            System.out.println("Successfully assigned role " + role + " to user " + id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error in assignRole: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Remove role from user
    @DeleteMapping("/{id}/roles/{role}")
    public ResponseEntity<User> removeRole(@PathVariable Long id, @PathVariable User.UserRole role) {
        try {
            System.out.println("=== DELETE /api/users/" + id + "/roles/" + role + " called ===");
            User user = userService.removeRole(id, role);
            System.out.println("Successfully removed role " + role + " from user " + id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error in removeRole: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Assign permission to user
    @PostMapping("/{id}/permissions/{permission}")
    public ResponseEntity<User> assignPermission(@PathVariable Long id, @PathVariable User.Permission permission) {
        try {
            System.out.println("=== POST /api/users/" + id + "/permissions/" + permission + " called ===");
            User user = userService.assignPermission(id, permission);
            System.out.println("Successfully assigned permission " + permission + " to user " + id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error in assignPermission: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Remove permission from user
    @DeleteMapping("/{id}/permissions/{permission}")
    public ResponseEntity<User> removePermission(@PathVariable Long id, @PathVariable User.Permission permission) {
        try {
            System.out.println("=== DELETE /api/users/" + id + "/permissions/" + permission + " called ===");
            User user = userService.removePermission(id, permission);
            System.out.println("Successfully removed permission " + permission + " from user " + id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error in removePermission: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Get user statistics
    @GetMapping("/stats")
    public ResponseEntity<UserStats> getUserStats() {
        try {
            System.out.println("=== GET /api/users/stats called ===");
            UserStats stats = new UserStats();
            stats.totalUsers = userService.getTotalUsers();
            stats.activeUsers = userService.getActiveUsers();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error in getUserStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Inner class for user statistics
    public static class UserStats {
        public long totalUsers;
        public long activeUsers;
    }
}
