package com.j21.telecom.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.CustomerRequestDTO;
import com.j21.telecom.dto.CustomerResponseDTO;
import com.j21.telecom.entity.Customer;
import com.j21.telecom.entity.Customer.KycStatus;
import com.j21.telecom.entity.Role;
import com.j21.telecom.entity.User;
import com.j21.telecom.repository.CustomerRepository;
import com.j21.telecom.repository.RoleRepository;
import com.j21.telecom.repository.UserRepository;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            UserRepository userRepository,
            RoleRepository roleRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // Get all customers
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get customer by ID
    @Transactional(readOnly = true)
    public Optional<CustomerResponseDTO> getCustomerById(Long customerId) {
        return customerRepository.findById(customerId)
                .map(this::convertToDTO);
    }

    // Get customer by associated user ID
    @Transactional(readOnly = true)
    public Optional<CustomerResponseDTO> getCustomerByUserId(Long userId) {
        return Optional.ofNullable(
                customerRepository.findByUserUserId(userId)
        ).map(this::convertToDTO);
    }

    // Create a new customer
    public CustomerResponseDTO createCustomer(CustomerRequestDTO dto) {
        User user;

        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "User not found with ID: " + dto.getUserId()));

            if (customerRepository.findByUserUserId(dto.getUserId()) != null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "This user is already registered as a customer");
            }
        } else {
            if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
            }
            if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
            }
            if (userRepository.existsByEmail(dto.getEmail().trim())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "A user with email " + dto.getEmail() + " already exists");
            }

            Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setRoleName("CUSTOMER");
                        r.setDescription("Telecommunications customer");
                        return roleRepository.save(r);
                    });

            user = new User();
            user.setRole(customerRole);
            user.setFullName(dto.getFullName().trim());
            user.setEmail(dto.getEmail().trim());
            user.setPhone(dto.getPhone());
            user.setPasswordHash("PLACEHOLDER_HASH_CUSTOMER");
            user.setIsActive(true);
            user = userRepository.save(user);
        }

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setPostalCode(dto.getPincode());

        if (dto.getKycStatus() != null) {
            try {
                customer.setKycStatus(KycStatus.valueOf(dto.getKycStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setKycStatus(KycStatus.PENDING);
            }
        } else {
            customer.setKycStatus(KycStatus.PENDING);
        }

        Customer savedCustomer = customerRepository.save(customer);
        return convertToDTO(savedCustomer);
    }

    // Update an existing customer
    public CustomerResponseDTO updateCustomer(Long customerId, CustomerRequestDTO dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));

        if (dto.getAddress() != null) customer.setAddress(dto.getAddress());
        if (dto.getCity() != null) customer.setCity(dto.getCity());
        if (dto.getState() != null) customer.setState(dto.getState());
        if (dto.getPincode() != null) customer.setPostalCode(dto.getPincode());

        if (dto.getKycStatus() != null) {
            try {
                customer.setKycStatus(KycStatus.valueOf(dto.getKycStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        // Update user information if provided
        if (customer.getUser() != null) {
            User user = customer.getUser();
            if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
                user.setFullName(dto.getFullName().trim());
            }
            if (dto.getPhone() != null) {
                user.setPhone(dto.getPhone());
            }
            if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty() && !dto.getEmail().trim().equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(dto.getEmail().trim())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use by another user");
                }
                user.setEmail(dto.getEmail().trim());
            }
            userRepository.save(user);
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return convertToDTO(updatedCustomer);
    }

    // Delete a customer
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));
        customerRepository.delete(customer);
    }

    // Convert Customer entity into response DTO
    public CustomerResponseDTO convertToDTO(Customer customer) {
        CustomerResponseDTO dto = new CustomerResponseDTO();

        dto.setCustomerId(customer.getCustomerId());

        if (customer.getUser() != null) {
            dto.setUserId(customer.getUser().getUserId());
            dto.setFullName(customer.getUser().getFullName());
            dto.setEmail(customer.getUser().getEmail());
            dto.setPhone(customer.getUser().getPhone());
        }

        dto.setAddress(customer.getAddress());
        dto.setCity(customer.getCity());
        dto.setState(customer.getState());
        dto.setPincode(customer.getPostalCode());
        dto.setKycStatus(customer.getKycStatus() != null ? customer.getKycStatus().name() : "PENDING");

        return dto;
    }
}
