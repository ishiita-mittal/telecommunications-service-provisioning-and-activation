
package com.j21.telecom.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.j21.telecom.dto.UserRequestDTO;
import com.j21.telecom.dto.UserResponseDTO;
import com.j21.telecom.dto.RegistrationRequestDTO;
import com.j21.telecom.entity.Role;
import com.j21.telecom.entity.User;
import com.j21.telecom.entity.Customer;
import com.j21.telecom.repository.RoleRepository;
import com.j21.telecom.repository.UserRepository;
import com.j21.telecom.repository.CustomerRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CustomerRepository customerRepository) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.customerRepository = customerRepository;
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

    // Get user by ID
    @Transactional(readOnly = true)
    public Optional<UserResponseDTO> getUserResponseById(Long userId) {

        return userRepository.findById(userId)
                .map(this::convertToDTO);
    }

    // Get user by email
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

    // Existing user creation method - retained for existing modules
    public UserResponseDTO createUser(UserRequestDTO dto) {

        if (emailExists(dto.getEmail().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists: " + dto.getEmail());
        }

        Role role;

        if (dto.getRoleId() != null) {

            role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Role not found"));

        } else if (dto.getRoleName() != null
                && !dto.getRoleName().trim().isEmpty()) {

            role = roleRepository.findByRoleName(dto.getRoleName().trim())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Role not found: " + dto.getRoleName()));

        } else {

            role = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Default role CUSTOMER not found"));
        }

        User user = new User();

        user.setFullName(dto.getFullName().trim());
        user.setEmail(dto.getEmail().trim());
        user.setPhone(dto.getPhone());
        user.setRole(role);

        // Retained for compatibility with existing modules.
        // Do not use this legacy password method for new accounts.
        user.setPasswordHash(
                dto.getPassword() != null
                        ? "HASH_" + dto.getPassword().hashCode()
                        : "PLACEHOLDER_USER_HASH");

        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        return convertToDTO(savedUser);
    }

    // Public customer registration
    // Creates both User and Customer records in one transaction
    public UserResponseDTO registerCustomer(RegistrationRequestDTO dto) {

        String email = dto.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered");
        }

        // Public registration always creates a CUSTOMER
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "CUSTOMER role not found"));

        // Create user account
        User user = new User();

        user.setFullName(dto.getFullName().trim());
        user.setEmail(email);
        user.setPhone(dto.getPhone());
        user.setRole(customerRole);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Create linked customer profile
        Customer customer = new Customer();

        customer.setUser(savedUser);
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setPostalCode(dto.getPincode());
        customer.setKycStatus(Customer.KycStatus.PENDING);

        customerRepository.save(customer);

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

    // Login user
    public UserResponseDTO login(String email, String password) {

        User user = userRepository.findByEmail(
                email.trim().toLowerCase());

        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is inactive");
        }

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        return convertToDTO(user);
    }
}
