package com.j21.telecom.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.ServiceAgentRequestDTO;
import com.j21.telecom.entity.Role;
import com.j21.telecom.entity.ServiceAgent;
import com.j21.telecom.entity.User;
import com.j21.telecom.repository.RoleRepository;
import com.j21.telecom.repository.ServiceAgentRepository;
import com.j21.telecom.repository.UserRepository;

@Service
@Transactional
public class ServiceAgentService {

    private final ServiceAgentRepository serviceAgentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public ServiceAgentService(
            ServiceAgentRepository serviceAgentRepository,
            UserRepository userRepository,
            RoleRepository roleRepository) {

        this.serviceAgentRepository = serviceAgentRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // Get all service agents
    @Transactional(readOnly = true)
    public List<ServiceAgent> getAllAgents() {
        return serviceAgentRepository.findAll();
    }

    // Get service agent by ID
    @Transactional(readOnly = true)
    public ServiceAgent getAgentById(Long agentId) {
        return serviceAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service agent not found with ID: " + agentId));
    }

    // Get service agent by user ID
    @Transactional(readOnly = true)
    public ServiceAgent getAgentByUserId(Long userId) {
        ServiceAgent agent = serviceAgentRepository.findByUserUserId(userId);
        if (agent == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Service agent not found for user ID: " + userId);
        }
        return agent;
    }

    // Check whether employee code exists
    @Transactional(readOnly = true)
    public boolean employeeCodeExists(String employeeCode) {
        return serviceAgentRepository.existsByEmployeeCode(employeeCode);
    }

    // Create a new service agent
    public ServiceAgent createAgent(ServiceAgentRequestDTO dto) {
        if (dto.getEmployeeCode() == null || dto.getEmployeeCode().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee code is required");
        }

        String empCode = dto.getEmployeeCode().trim();
        if (employeeCodeExists(empCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee code already exists: " + empCode);
        }

        User user;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "User not found with ID: " + dto.getUserId()));

            if (serviceAgentRepository.findByUserUserId(dto.getUserId()) != null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "This user is already registered as an agent");
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

            Role agentRole = roleRepository.findByRoleName("SERVICE_AGENT")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setRoleName("SERVICE_AGENT");
                        r.setDescription("Service order processing agent");
                        return roleRepository.save(r);
                    });

            user = new User();
            user.setRole(agentRole);
            user.setFullName(dto.getFullName().trim());
            user.setEmail(dto.getEmail().trim());
            user.setPhone(dto.getPhone());
            user.setPasswordHash("PLACEHOLDER_HASH_AGENT");
            user.setIsActive(true);
            user = userRepository.save(user);
        }

        ServiceAgent agent = new ServiceAgent();
        agent.setUser(user);
        agent.setEmployeeCode(empCode);
        agent.setDepartment(dto.getDepartment() != null ? dto.getDepartment().trim() : "Technical Support");

        return serviceAgentRepository.save(agent);
    }

    // Update an existing service agent
    public ServiceAgent updateAgent(Long agentId, ServiceAgentRequestDTO dto) {
        ServiceAgent agent = getAgentById(agentId);

        if (dto.getEmployeeCode() != null && !dto.getEmployeeCode().trim().isEmpty()) {
            String empCode = dto.getEmployeeCode().trim();
            if (serviceAgentRepository.existsByEmployeeCode(empCode)
                    && !agent.getEmployeeCode().equalsIgnoreCase(empCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee code already exists: " + empCode);
            }
            agent.setEmployeeCode(empCode);
        }

        if (dto.getUserId() != null && !dto.getUserId().equals(agent.getUser().getUserId())) {
            User newUser = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "User not found with ID: " + dto.getUserId()));

            ServiceAgent existingAgent = serviceAgentRepository.findByUserUserId(dto.getUserId());
            if (existingAgent != null && !existingAgent.getAgentId().equals(agentId)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "This user is already registered as another agent");
            }
            agent.setUser(newUser);
        }

        // Update user profile info if provided
        if (agent.getUser() != null) {
            User user = agent.getUser();
            if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
                user.setFullName(dto.getFullName().trim());
            }
            if (dto.getPhone() != null) {
                user.setPhone(dto.getPhone());
            }
            if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty() && !dto.getEmail().trim().equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(dto.getEmail().trim())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
                }
                user.setEmail(dto.getEmail().trim());
            }
            userRepository.save(user);
        }

        if (dto.getDepartment() != null) {
            agent.setDepartment(dto.getDepartment().trim());
        }

        return serviceAgentRepository.save(agent);
    }

    // Delete a service agent
    public void deleteAgent(Long agentId) {
        ServiceAgent agent = getAgentById(agentId);
        serviceAgentRepository.delete(agent);
    }
}
