package com.j21.telecom.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.j21.telecom.dto.DashboardStatsDTO;
import com.j21.telecom.dto.ServiceOrderResponseDTO;
import com.j21.telecom.entity.ActivationRecord.ActivationStatus;
import com.j21.telecom.entity.NetworkResource.ResourceStatus;
import com.j21.telecom.entity.ProvisioningTask.TaskStatus;
import com.j21.telecom.entity.ServiceOrder.OrderStatus;
import com.j21.telecom.repository.ActivationRecordRepository;
import com.j21.telecom.repository.CustomerRepository;
import com.j21.telecom.repository.NetworkResourceRepository;
import com.j21.telecom.repository.ProvisioningTaskRepository;
import com.j21.telecom.repository.ServiceOrderRepository;
import com.j21.telecom.repository.ServicePlanRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final ServicePlanRepository servicePlanRepository;
    private final ActivationRecordRepository activationRecordRepository;
    private final ProvisioningTaskRepository provisioningTaskRepository;
    private final NetworkResourceRepository networkResourceRepository;
    private final ServiceOrderService serviceOrderService;

    public DashboardService(
            CustomerRepository customerRepository,
            ServiceOrderRepository serviceOrderRepository,
            ServicePlanRepository servicePlanRepository,
            ActivationRecordRepository activationRecordRepository,
            ProvisioningTaskRepository provisioningTaskRepository,
            NetworkResourceRepository networkResourceRepository,
            ServiceOrderService serviceOrderService) {
        this.customerRepository = customerRepository;
        this.serviceOrderRepository = serviceOrderRepository;
        this.servicePlanRepository = servicePlanRepository;
        this.activationRecordRepository = activationRecordRepository;
        this.provisioningTaskRepository = provisioningTaskRepository;
        this.networkResourceRepository = networkResourceRepository;
        this.serviceOrderService = serviceOrderService;
    }

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO dto = new DashboardStatsDTO();

        dto.setTotalCustomers(customerRepository.count());
        dto.setTotalOrders(serviceOrderRepository.count());
        dto.setActivePlans(servicePlanRepository.countByIsAvailableTrue());

        long activeFromRecords = activationRecordRepository.countByActivationStatus(ActivationStatus.ACTIVE);
        long activeFromOrders = serviceOrderRepository.countByOrderStatus(OrderStatus.ACTIVE);
        dto.setActivatedServices(Math.max(activeFromRecords, activeFromOrders));

        List<ServiceOrderResponseDTO> recent = serviceOrderRepository.findTop10ByOrderByOrderIdDesc()
                .stream()
                .map(serviceOrderService::convertToDTO)
                .collect(Collectors.toList());
        dto.setRecentOrders(recent);

        Map<String, Long> provSummary = new HashMap<>();
        provSummary.put("PENDING", provisioningTaskRepository.countByTaskStatus(TaskStatus.PENDING));
        provSummary.put("IN_PROGRESS", provisioningTaskRepository.countByTaskStatus(TaskStatus.IN_PROGRESS));
        provSummary.put("COMPLETED", provisioningTaskRepository.countByTaskStatus(TaskStatus.COMPLETED));
        provSummary.put("FAILED", provisioningTaskRepository.countByTaskStatus(TaskStatus.FAILED));
        dto.setProvisioningStatusSummary(provSummary);

        Map<String, Long> resSummary = new HashMap<>();
        resSummary.put("AVAILABLE", networkResourceRepository.countByResourceStatus(ResourceStatus.AVAILABLE));
        resSummary.put("ALLOCATED", networkResourceRepository.countByResourceStatus(ResourceStatus.ALLOCATED));
        resSummary.put("MAINTENANCE", networkResourceRepository.countByResourceStatus(ResourceStatus.MAINTENANCE));
        dto.setResourceStatusSummary(resSummary);

        return dto;
    }
}
