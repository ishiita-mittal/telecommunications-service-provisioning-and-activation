
package com.j21.telecom.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.ServicePlanRequestDTO;
import com.j21.telecom.entity.ServicePlan;
import com.j21.telecom.repository.ServicePlanRepository;

@Service
@Transactional
public class ServicePlanService {

    private final ServicePlanRepository servicePlanRepository;

    public ServicePlanService(ServicePlanRepository servicePlanRepository) {
        this.servicePlanRepository = servicePlanRepository;
    }

    public List<ServicePlan> getAllPlans() {
        return servicePlanRepository.findAll();
    }

    public List<ServicePlan> getAvailablePlans() {
        return servicePlanRepository.findByIsAvailableTrue();
    }

    public ServicePlan getPlanById(Long planId) {
        return servicePlanRepository.findById(planId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Service plan not found"));
    }

    public List<ServicePlan> getPlansByType(String planType) {
        return servicePlanRepository.findByPlanType(planType);
    }

    public ServicePlan createPlan(ServicePlanRequestDTO dto) {
        ServicePlan plan = new ServicePlan();
        mapDTOToEntity(dto, plan);
        return servicePlanRepository.save(plan);
    }

    public ServicePlan updatePlan(Long planId, ServicePlanRequestDTO dto) {
        ServicePlan plan = getPlanById(planId);
        mapDTOToEntity(dto, plan);
        return servicePlanRepository.save(plan);
    }

    public void deletePlan(Long planId) {
        ServicePlan plan = getPlanById(planId);
        servicePlanRepository.delete(plan);
    }

    private void mapDTOToEntity(ServicePlanRequestDTO dto, ServicePlan plan) {
        plan.setPlanName(dto.getPlanName());
        plan.setPlanType(dto.getPlanType());
        plan.setDescription(dto.getDescription());
        plan.setMonthlyPrice(dto.getMonthlyPrice());
        plan.setDataLimitGb(dto.getDataLimitGb());
        plan.setValidityDays(dto.getValidityDays() != null ? dto.getValidityDays() : 30);
        plan.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true);
    }
}
