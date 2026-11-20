package com.j21.telecom.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.ProvisioningTaskResponseDTO;
import com.j21.telecom.dto.ResourceAllocationResponseDTO;
import com.j21.telecom.entity.ActivationRecord;
import com.j21.telecom.entity.ActivationRecord.ActivationStatus;
import com.j21.telecom.entity.NetworkResource;
import com.j21.telecom.entity.OrderStatusHistory;
import com.j21.telecom.entity.ProvisioningTask;
import com.j21.telecom.entity.ProvisioningTask.TaskStatus;
import com.j21.telecom.entity.ResourceAllocation;
import com.j21.telecom.entity.ServiceAgent;
import com.j21.telecom.entity.ServiceOrder;
import com.j21.telecom.entity.ServiceOrder.OrderStatus;
import com.j21.telecom.repository.ActivationRecordRepository;
import com.j21.telecom.repository.NetworkResourceRepository;
import com.j21.telecom.repository.OrderStatusHistoryRepository;
import com.j21.telecom.repository.ProvisioningTaskRepository;
import com.j21.telecom.repository.ResourceAllocationRepository;
import com.j21.telecom.repository.ServiceAgentRepository;
import com.j21.telecom.repository.ServiceOrderRepository;

@Service
@Transactional
public class ProvisioningService {

    private final ProvisioningTaskRepository provisioningTaskRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final NetworkResourceRepository networkResourceRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final ServiceAgentRepository serviceAgentRepository;
    private final ActivationRecordRepository activationRecordRepository;
    private final OrderStatusHistoryRepository historyRepository;

    public ProvisioningService(
            ProvisioningTaskRepository provisioningTaskRepository,
            ResourceAllocationRepository resourceAllocationRepository,
            NetworkResourceRepository networkResourceRepository,
            ServiceOrderRepository serviceOrderRepository,
            ServiceAgentRepository serviceAgentRepository,
            ActivationRecordRepository activationRecordRepository,
            OrderStatusHistoryRepository historyRepository) {
        this.provisioningTaskRepository = provisioningTaskRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.networkResourceRepository = networkResourceRepository;
        this.serviceOrderRepository = serviceOrderRepository;
        this.serviceAgentRepository = serviceAgentRepository;
        this.activationRecordRepository = activationRecordRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public List<ProvisioningTaskResponseDTO> getAllTasks() {
        return provisioningTaskRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProvisioningTaskResponseDTO getTaskById(Long taskId) {
        ProvisioningTask task = provisioningTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Provisioning task not found with ID: " + taskId));
        return convertToDTO(task);
    }

    @Transactional(readOnly = true)
    public List<ProvisioningTaskResponseDTO> getTasksByStatus(String statusStr) {
        try {
            TaskStatus status = TaskStatus.valueOf(statusStr.toUpperCase());
            return provisioningTaskRepository.findByTaskStatus(status)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid task status: " + statusStr);
        }
    }

    // Start a provisioning task
    public ProvisioningTaskResponseDTO startTask(Long taskId, Long agentId) {
        ProvisioningTask task = provisioningTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Provisioning task not found with ID: " + taskId));

        task.setTaskStatus(TaskStatus.IN_PROGRESS);
        task.setStartedAt(LocalDateTime.now());

        if (agentId != null) {
            ServiceAgent agent = serviceAgentRepository.findById(agentId).orElse(null);
            if (agent != null) task.setAssignedAgent(agent);
        }

        if (task.getServiceOrder() != null) {
            ServiceOrder order = task.getServiceOrder();
            String oldStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : null;
            order.setOrderStatus(OrderStatus.PROVISIONING);
            serviceOrderRepository.save(order);

            OrderStatusHistory history = new OrderStatusHistory();
            history.setServiceOrder(order);
            history.setChangedBy(task.getAssignedAgent());
            history.setOldStatus(oldStatus);
            history.setNewStatus(OrderStatus.PROVISIONING.name());
            history.setRemarks("Provisioning started for task #" + taskId);
            historyRepository.save(history);
        }

        ProvisioningTask saved = provisioningTaskRepository.save(task);
        return convertToDTO(saved);
    }

    // Allocate network resource to order
    public ResourceAllocationResponseDTO allocateResource(Long taskId, Long resourceId) {
        ProvisioningTask task = provisioningTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Provisioning task not found with ID: " + taskId));

        NetworkResource resource = networkResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Network resource not found with ID: " + resourceId));

        if (resource.getResourceStatus() != NetworkResource.ResourceStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Resource is not available: " + resource.getResourceIdentifier());
        }

        ServiceOrder order = task.getServiceOrder();
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task is not associated with an order");
        }

        resource.setResourceStatus(NetworkResource.ResourceStatus.ALLOCATED);
        networkResourceRepository.save(resource);

        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setNetworkResource(resource);
        allocation.setServiceOrder(order);
        allocation.setAllocatedAt(LocalDateTime.now());

        ResourceAllocation saved = resourceAllocationRepository.save(allocation);

        task.setRemarks((task.getRemarks() != null ? task.getRemarks() + "; " : "") +
                "Allocated resource: " + resource.getResourceIdentifier());
        provisioningTaskRepository.save(task);

        return convertAllocationToDTO(saved);
    }

    // Complete a provisioning task -> transitions order to ACTIVATION_PENDING & creates ActivationRecord
    public ProvisioningTaskResponseDTO completeTask(Long taskId, Long agentId, String remarks) {
        ProvisioningTask task = provisioningTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Provisioning task not found with ID: " + taskId));

        task.setTaskStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());

        if (remarks != null && !remarks.trim().isEmpty()) {
            task.setRemarks(remarks.trim());
        }

        if (agentId != null) {
            ServiceAgent agent = serviceAgentRepository.findById(agentId).orElse(null);
            if (agent != null) task.setAssignedAgent(agent);
        }

        if (task.getServiceOrder() != null) {
            ServiceOrder order = task.getServiceOrder();
            String oldStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : null;
            order.setOrderStatus(OrderStatus.ACTIVATION_PENDING);
            serviceOrderRepository.save(order);

            // Record status history
            OrderStatusHistory history = new OrderStatusHistory();
            history.setServiceOrder(order);
            history.setChangedBy(task.getAssignedAgent());
            history.setOldStatus(oldStatus);
            history.setNewStatus(OrderStatus.ACTIVATION_PENDING.name());
            history.setRemarks("Provisioning completed; awaiting service activation testing");
            historyRepository.save(history);

            // Create or get activation record
            activationRecordRepository.findByServiceOrderOrderId(order.getOrderId())
                    .orElseGet(() -> {
                        ActivationRecord act = new ActivationRecord();
                        act.setServiceOrder(order);
                        act.setActivatedBy(task.getAssignedAgent());
                        act.setActivationStatus(ActivationStatus.PENDING);
                        act.setRemarks("Ready for activation test");
                        return activationRecordRepository.save(act);
                    });
        }

        ProvisioningTask saved = provisioningTaskRepository.save(task);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ResourceAllocationResponseDTO> getAllAllocations() {
        return resourceAllocationRepository.findAll()
                .stream()
                .map(this::convertAllocationToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResourceAllocationResponseDTO getAllocationById(Long allocationId) {
        ResourceAllocation alloc = resourceAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Allocation not found with ID: " + allocationId));
        return convertAllocationToDTO(alloc);
    }

    public ProvisioningTaskResponseDTO convertToDTO(ProvisioningTask task) {
        ProvisioningTaskResponseDTO dto = new ProvisioningTaskResponseDTO();
        dto.setTaskId(task.getTaskId());
        dto.setTaskStatus(task.getTaskStatus() != null ? task.getTaskStatus().name() : "PENDING");
        dto.setStartedAt(task.getStartedAt());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setRemarks(task.getRemarks());
        dto.setCreatedAt(task.getCreatedAt());

        if (task.getServiceOrder() != null) {
            dto.setOrderId(task.getServiceOrder().getOrderId());
            if (task.getServiceOrder().getCustomer() != null && task.getServiceOrder().getCustomer().getUser() != null) {
                dto.setCustomerName(task.getServiceOrder().getCustomer().getUser().getFullName());
            }
            if (task.getServiceOrder().getServicePlan() != null) {
                dto.setPlanName(task.getServiceOrder().getServicePlan().getPlanName());
            }
            // Find allocated resource identifier
            List<ResourceAllocation> allocations = resourceAllocationRepository.findByServiceOrderOrderId(task.getServiceOrder().getOrderId());
            if (!allocations.isEmpty() && allocations.get(0).getNetworkResource() != null) {
                dto.setResourceIdentifier(allocations.get(0).getNetworkResource().getResourceIdentifier());
            }
        }

        if (task.getAssignedAgent() != null) {
            dto.setAssignedAgent(task.getAssignedAgent().getAgentId());
            if (task.getAssignedAgent().getUser() != null) {
                dto.setAgentName(task.getAssignedAgent().getUser().getFullName());
            } else {
                dto.setAgentName(task.getAssignedAgent().getEmployeeCode());
            }
        }

        return dto;
    }

    public ResourceAllocationResponseDTO convertAllocationToDTO(ResourceAllocation alloc) {
        ResourceAllocationResponseDTO dto = new ResourceAllocationResponseDTO();
        dto.setAllocationId(alloc.getAllocationId());
        dto.setAllocatedAt(alloc.getAllocatedAt());
        dto.setReleasedAt(alloc.getReleasedAt());

        if (alloc.getServiceOrder() != null) {
            dto.setOrderId(alloc.getServiceOrder().getOrderId());
        }

        if (alloc.getNetworkResource() != null) {
            dto.setResourceId(alloc.getNetworkResource().getResourceId());
            dto.setResourceIdentifier(alloc.getNetworkResource().getResourceIdentifier());
            dto.setResourceType(alloc.getNetworkResource().getResourceType());
        }

        return dto;
    }
}
