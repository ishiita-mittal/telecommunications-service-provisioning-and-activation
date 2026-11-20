
package com.j21.telecom.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.j21.telecom.dto.ServiceAgentRequestDTO;
import com.j21.telecom.dto.ServiceAgentResponseDTO;
import com.j21.telecom.entity.ServiceAgent;
import com.j21.telecom.service.ServiceAgentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agents")
public class ServiceAgentController {

    private final ServiceAgentService serviceAgentService;

    public ServiceAgentController(ServiceAgentService serviceAgentService) {
        this.serviceAgentService = serviceAgentService;
    }

    // Get all service agents
    @GetMapping
    public ResponseEntity<List<ServiceAgentResponseDTO>> getAllAgents() {

        List<ServiceAgentResponseDTO> agents =
                serviceAgentService.getAllAgents()
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(agents);
    }

    // Get agent by ID
    @GetMapping("/{agentId}")
    public ResponseEntity<ServiceAgentResponseDTO> getAgentById(
            @PathVariable Long agentId) {

        ServiceAgent agent =
                serviceAgentService.getAgentById(agentId);

        return ResponseEntity.ok(convertToDTO(agent));
    }

    // Get agent by user ID
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ServiceAgentResponseDTO> getAgentByUserId(
            @PathVariable Long userId) {

        ServiceAgent agent =
                serviceAgentService.getAgentByUserId(userId);

        return ResponseEntity.ok(convertToDTO(agent));
    }

    // Check whether employee code exists
    @GetMapping("/employee-code-exists")
    public ResponseEntity<Boolean> employeeCodeExists(
            @RequestParam String employeeCode) {

        return ResponseEntity.ok(
                serviceAgentService.employeeCodeExists(employeeCode));
    }

    // Create a new service agent
    @PostMapping
    public ResponseEntity<ServiceAgentResponseDTO> createAgent(
            @Valid @RequestBody ServiceAgentRequestDTO dto) {

        ServiceAgent savedAgent =
                serviceAgentService.createAgent(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(savedAgent));
    }

    // Update an existing service agent
    @PutMapping("/{agentId}")
    public ResponseEntity<ServiceAgentResponseDTO> updateAgent(
            @PathVariable Long agentId,
            @Valid @RequestBody ServiceAgentRequestDTO dto) {

        ServiceAgent updatedAgent =
                serviceAgentService.updateAgent(agentId, dto);

        return ResponseEntity.ok(convertToDTO(updatedAgent));
    }

    // Delete a service agent
    @DeleteMapping("/{agentId}")
    public ResponseEntity<Void> deleteAgent(
            @PathVariable Long agentId) {

        serviceAgentService.deleteAgent(agentId);

        return ResponseEntity.noContent().build();
    }

    // Convert entity to response DTO
    private ServiceAgentResponseDTO convertToDTO(ServiceAgent agent) {

        ServiceAgentResponseDTO dto = new ServiceAgentResponseDTO();

        dto.setAgentId(agent.getAgentId());
        dto.setEmployeeCode(agent.getEmployeeCode());
        dto.setDepartment(agent.getDepartment());

        if (agent.getUser() != null) {
            dto.setUserId(agent.getUser().getUserId());
            dto.setFullName(agent.getUser().getFullName());
            dto.setEmail(agent.getUser().getEmail());
            dto.setPhone(agent.getUser().getPhone());
        }

        return dto;
    }
}
