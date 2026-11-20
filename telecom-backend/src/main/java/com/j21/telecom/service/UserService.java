package com.j21.telecom.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.UserRequestDTO;
import com.j21.telecom.dto.UserResponseDTO;
import com.j21.telecom.entity.Role;
import com.j21.telecom.entity.User;
import com.j21.telecom.repository.RoleRepository;
import com.j21.telecom.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // Get all users
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get users by role name
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(String roleName) {
        return userRepository.findByRoleRoleName(roleName)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get user by ID and convert to DTO
    @Transactional(readOnly = true)
    public Optional<UserResponseDTO> getUserResponseById(Long userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO);
    }

    // Get user by email and convert to DTO
    @Transactional(readOnly = true)
    public Optional<UserResponseDTO> getUserResponseByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email))
                .map(this::convertToDTO);
    }

    // Check whether email already exists
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // Create new user safely
    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (emailExists(dto.getEmail().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + dto.getEmail());
        }

        Role role;
        if (dto.getRoleId() != null) {
            role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
        } else if (dto.getRoleName() != null && !dto.getRoleName().trim().isEmpty()) {
            role = roleRepository.findByRoleName(dto.getRoleName().trim())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found: " + dto.getRoleName()));
        } else {
            role = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Default role CUSTOMER not found"));
        }

        User user = new User();
        user.setFullName(dto.getFullName().trim());
        user.setEmail(dto.getEmail().trim());
        user.setPhone(dto.getPhone());
        user.setRole(role);
        user.setPasswordHash(dto.getPassword() != null ? "HASH_" + dto.getPassword().hashCode() : "PLACEHOLDER_USER_HASH");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // Convert User entity into safe response DTO
    public UserResponseDTO convertToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();

        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());

        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getRoleName());
        }

        return dto;
    }
}
