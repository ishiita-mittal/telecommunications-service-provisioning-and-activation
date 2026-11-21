
package com.j21.telecom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.j21.telecom.dto.UserRequestDTO;
import com.j21.telecom.dto.UserResponseDTO;
import com.j21.telecom.dto.RegistrationRequestDTO;
import com.j21.telecom.service.UserService;
import com.j21.telecom.dto.LoginRequestDTO;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users (passwords never exposed)
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get users by role
    @GetMapping("/by-role/{roleName}")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(
            @PathVariable String roleName) {

        return ResponseEntity.ok(userService.getUsersByRole(roleName));
    }

    // Get user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(
            @PathVariable Long userId) {

        return userService.getUserResponseById(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get user by email
    @GetMapping("/by-email")
    public ResponseEntity<UserResponseDTO> getUserByEmail(
            @RequestParam String email) {

        return userService.getUserResponseByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Check whether email exists
    @GetMapping("/email-exists")
    public ResponseEntity<Boolean> emailExists(
            @RequestParam String email) {

        return ResponseEntity.ok(userService.emailExists(email));
    }

    // Existing user creation endpoint
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(
            @Valid @RequestBody UserRequestDTO dto) {

        UserResponseDTO user = userService.createUser(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    // NEW: Public customer registration endpoint
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registerCustomer(
            @Valid @RequestBody RegistrationRequestDTO dto) {

        UserResponseDTO user = userService.registerCustomer(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request) {

        UserResponseDTO user = userService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(user);
    }
}
