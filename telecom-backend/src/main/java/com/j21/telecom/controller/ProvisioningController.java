package com.j21.telecom.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.j21.telecom.dto.ProvisioningTaskResponseDTO;
import com.j21.telecom.dto.ResourceAllocationResponseDTO;
import com.j21.telecom.service.ProvisioningService;

@RestController
@RequestMapping("/api/provisioning")
public class ProvisioningController {

    private final ProvisioningService provisioningService;

    public ProvisioningController(ProvisioningService provisioningService) {
        this.provisioningService = provisioningService;
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<ProvisioningTaskResponseDTO>> getAllTasks() {
        return ResponseEntity.ok(provisioningService.getAllTasks());
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ProvisioningTaskResponseDTO> getTaskById(@PathVariable Long taskId) {
        return ResponseEntity.ok(provisioningService.getTaskById(taskId));
    }

    @GetMapping("/tasks/by-status")
    public ResponseEntity<List<ProvisioningTaskResponseDTO>> getTasksByStatus(@RequestParam String status) {
        return ResponseEntity.ok(provisioningService.getTasksByStatus(status));
    }

    @PostMapping("/tasks/{taskId}/start")
    public ResponseEntity<ProvisioningTaskResponseDTO> startTask(
            @PathVariable Long taskId,
            @RequestParam(required = false) Long agentId) {
        return ResponseEntity.ok(provisioningService.startTask(taskId, agentId));
    }

    @PostMapping("/tasks/{taskId}/allocate")
    public ResponseEntity<ResourceAllocationResponseDTO> allocateResource(
            @PathVariable Long taskId,
            @RequestParam Long resourceId) {
        return ResponseEntity.ok(provisioningService.allocateResource(taskId, resourceId));
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<ProvisioningTaskResponseDTO> completeTask(
            @PathVariable Long taskId,
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(provisioningService.completeTask(taskId, agentId, remarks));
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<ResourceAllocationResponseDTO>> getAllAllocations() {
        return ResponseEntity.ok(provisioningService.getAllAllocations());
    }

    @GetMapping("/allocations/{allocationId}")
    public ResponseEntity<ResourceAllocationResponseDTO> getAllocationById(@PathVariable Long allocationId) {
        return ResponseEntity.ok(provisioningService.getAllocationById(allocationId));
    }
}
