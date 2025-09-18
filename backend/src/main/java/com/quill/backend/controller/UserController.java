package com.quill.backend.controller;

import com.quill.backend.model.User;
import com.quill.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            String firstName = (String) request.get("firstName");
            String lastName = (String) request.get("lastName");
            String phone = (String) request.get("phone");
            
            // Basic validation
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Check if user already exists
            if (userService.existsByUsername(username)) {
                return ResponseEntity.badRequest().build();
            }
            if (userService.existsByEmail(email)) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userService.createUser(username, email, password, firstName, lastName);
            if (phone != null && !phone.trim().isEmpty()) {
                user.setPhone(phone);
                user = userService.save(user);
            }
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String email = (String) request.get("email");
            String firstName = (String) request.get("firstName");
            String lastName = (String) request.get("lastName");
            String phone = (String) request.get("phone");
            
            User updatedUser = userService.updateUser(id, username, email, firstName, lastName, phone);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        return userService.searchUsers(query);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = Map.of(
            "totalUsers", userService.getTotalUsers(),
            "activeUsers", userService.getActiveUsers()
        );
        return ResponseEntity.ok(stats);
    }
}
