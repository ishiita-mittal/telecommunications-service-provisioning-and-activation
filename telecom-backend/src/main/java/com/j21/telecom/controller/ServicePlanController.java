
package com.j21.telecom.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.j21.telecom.dto.ServicePlanRequestDTO;
import com.j21.telecom.dto.ServicePlanResponseDTO;
import com.j21.telecom.entity.ServicePlan;
import com.j21.telecom.service.ServicePlanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/plans")
public class ServicePlanController {

    private final ServicePlanService servicePlanService;

    public ServicePlanController(ServicePlanService servicePlanService) {
        this.servicePlanService = servicePlanService;
    }

    // Get all service plans
    @GetMapping
    public ResponseEntity<List<ServicePlanResponseDTO>> getAllPlans() {
        List<ServicePlanResponseDTO> plans = servicePlanService.getAllPlans()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(plans);
    }

    // Get available service plans
    @GetMapping("/available")
    public ResponseEntity<List<ServicePlanResponseDTO>> getAvailablePlans() {
        List<ServicePlanResponseDTO> plans = servicePlanService.getAvailablePlans()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(plans);
    }

    // Get service plan by ID
    @GetMapping("/{planId}")
    public ResponseEntity<ServicePlanResponseDTO> getPlanById(
            @PathVariable Long planId) {

        return ResponseEntity.ok(
                convertToDTO(servicePlanService.getPlanById(planId)));
    }

    // Get service plans by type
    @GetMapping("/type/{planType}")
    public ResponseEntity<List<ServicePlanResponseDTO>> getPlansByType(
            @PathVariable String planType) {

        List<ServicePlanResponseDTO> plans = servicePlanService
                .getPlansByType(planType)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(plans);
    }

    // Create a new service plan
    @PostMapping
    public ResponseEntity<ServicePlanResponseDTO> createPlan(
            @Valid @RequestBody ServicePlanRequestDTO dto) {

        ServicePlan savedPlan = servicePlanService.createPlan(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(savedPlan));
    }

    // Update an existing service plan
    @PutMapping("/{planId}")
    public ResponseEntity<ServicePlanResponseDTO> updatePlan(
            @PathVariable Long planId,
            @Valid @RequestBody ServicePlanRequestDTO dto) {

        ServicePlan updatedPlan = servicePlanService.updatePlan(planId, dto);

        return ResponseEntity.ok(convertToDTO(updatedPlan));
    }

    // Delete a service plan
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {

        servicePlanService.deletePlan(planId);

        return ResponseEntity.noContent().build();
    }

    // Convert Entity to Response DTO
    private ServicePlanResponseDTO convertToDTO(ServicePlan plan) {

        ServicePlanResponseDTO dto = new ServicePlanResponseDTO();

        dto.setPlanId(plan.getPlanId());
        dto.setPlanName(plan.getPlanName());
        dto.setPlanType(plan.getPlanType());
        dto.setDescription(plan.getDescription());
        dto.setMonthlyPrice(plan.getMonthlyPrice());
        dto.setDataLimitGb(plan.getDataLimitGb());
        dto.setValidityDays(plan.getValidityDays());
        dto.setIsAvailable(plan.getIsAvailable());
        dto.setCreatedAt(plan.getCreatedAt());

        return dto;
    }
}
