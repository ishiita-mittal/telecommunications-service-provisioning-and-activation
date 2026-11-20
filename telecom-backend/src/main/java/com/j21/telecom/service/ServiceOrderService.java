package com.j21.telecom.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.ServiceOrderRequestDTO;
import com.j21.telecom.dto.ServiceOrderResponseDTO;
import com.j21.telecom.entity.Customer;
import com.j21.telecom.entity.OrderStatusHistory;
import com.j21.telecom.entity.ProvisioningTask;
import com.j21.telecom.entity.ResourceAllocation;
import com.j21.telecom.entity.ServiceAgent;
import com.j21.telecom.entity.ServiceOrder;
import com.j21.telecom.entity.ServiceOrder.OrderStatus;
import com.j21.telecom.entity.ServicePlan;
import com.j21.telecom.repository.CustomerRepository;
import com.j21.telecom.repository.NetworkResourceRepository;
import com.j21.telecom.repository.OrderStatusHistoryRepository;
import com.j21.telecom.repository.ProvisioningTaskRepository;
import com.j21.telecom.repository.ResourceAllocationRepository;
import com.j21.telecom.repository.ServiceAgentRepository;
import com.j21.telecom.repository.ServiceOrderRepository;
import com.j21.telecom.repository.ServicePlanRepository;

@Service
@Transactional
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final CustomerRepository customerRepository;
    private final ServicePlanRepository servicePlanRepository;
    private final ServiceAgentRepository serviceAgentRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final ProvisioningTaskRepository provisioningTaskRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final NetworkResourceRepository resourceRepository;

    public ServiceOrderService(
            ServiceOrderRepository serviceOrderRepository,
            CustomerRepository customerRepository,
            ServicePlanRepository servicePlanRepository,
            ServiceAgentRepository serviceAgentRepository,
            OrderStatusHistoryRepository historyRepository,
            ProvisioningTaskRepository provisioningTaskRepository,
            ResourceAllocationRepository allocationRepository,
            NetworkResourceRepository resourceRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
        this.customerRepository = customerRepository;
        this.servicePlanRepository = servicePlanRepository;
        this.serviceAgentRepository = serviceAgentRepository;
        this.historyRepository = historyRepository;
        this.provisioningTaskRepository = provisioningTaskRepository;
        this.allocationRepository = allocationRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceOrderResponseDTO> getAllOrders() {
        return serviceOrderRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceOrderResponseDTO getOrderById(Long orderId) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Service order not found with ID: " + orderId));
        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<ServiceOrderResponseDTO> getOrdersByCustomer(Long customerId) {
        return serviceOrderRepository.findByCustomerCustomerId(customerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceOrderResponseDTO> getOrdersByStatus(String statusStr) {
        try {
            OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
            return serviceOrderRepository.findByOrderStatus(status)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status: " + statusStr);
        }
    }

    public ServiceOrderResponseDTO createOrder(ServiceOrderRequestDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found with ID: " + dto.getCustomerId()));

        ServicePlan plan = servicePlanRepository.findById(dto.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Service plan not found with ID: " + dto.getPlanId()));

        if (Boolean.FALSE.equals(plan.getIsAvailable())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected service plan is currently unavailable");
        }

        ServiceOrder order = new ServiceOrder();
        order.setCustomer(customer);
        order.setServicePlan(plan);
        order.setOrderStatus(OrderStatus.SUBMITTED);

        String address = dto.getInstallationAddress();
        if (address == null || address.trim().isEmpty()) {
            address = (customer.getAddress() != null ? customer.getAddress() : "")
                    + (customer.getCity() != null ? ", " + customer.getCity() : "")
                    + (customer.getState() != null ? ", " + customer.getState() : "");
            if (address.trim().isEmpty() || address.equals(", ")) {
                address = "Address pending confirmation";
            }
        }
        order.setInstallationAddress(address.trim());
        order.setApprovalRemarks(dto.getApprovalRemarks());

        if (dto.getReviewedBy() != null) {
            ServiceAgent agent = serviceAgentRepository.findById(dto.getReviewedBy()).orElse(null);
            order.setReviewedBy(agent);
        }

        ServiceOrder savedOrder = serviceOrderRepository.save(order);

        // Record initial status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setServiceOrder(savedOrder);
        history.setChangedBy(order.getReviewedBy());
        history.setOldStatus(null);
        history.setNewStatus(OrderStatus.SUBMITTED.name());
        history.setRemarks("Service order placed for plan " + plan.getPlanName());
        historyRepository.save(history);

        return convertToDTO(savedOrder);
    }

    public ServiceOrderResponseDTO updateOrderStatus(Long orderId, String newStatusStr, Long agentId, String remarks) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Service order not found with ID: " + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status: " + newStatusStr);
        }

        String oldStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : null;
        ServiceAgent agent = null;
        if (agentId != null) {
            agent = serviceAgentRepository.findById(agentId).orElse(null);
            if (agent != null) {
                order.setReviewedBy(agent);
            }
        }

        order.setOrderStatus(newStatus);
        if (remarks != null && !remarks.trim().isEmpty()) {
            order.setApprovalRemarks(remarks.trim());
        }

        // Auto-create provisioning task if moving to APPROVED or PROVISIONING
        if (newStatus == OrderStatus.APPROVED || newStatus == OrderStatus.PROVISIONING) {
            List<ProvisioningTask> existingTasks = provisioningTaskRepository.findByServiceOrderOrderId(orderId);
            if (existingTasks.isEmpty()) {
                ProvisioningTask task = new ProvisioningTask();
                task.setServiceOrder(order);
                task.setAssignedAgent(agent != null ? agent : order.getReviewedBy());
                task.setTaskStatus(ProvisioningTask.TaskStatus.PENDING);
                task.setRemarks("Auto-generated provisioning task for approved order #" + orderId);
                provisioningTaskRepository.save(task);
            }
        }

        ServiceOrder updatedOrder = serviceOrderRepository.save(order);

        // Record status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setServiceOrder(updatedOrder);
        history.setChangedBy(agent != null ? agent : order.getReviewedBy());
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus.name());
        history.setRemarks(remarks != null ? remarks : "Order transitioned to " + newStatus.name());
        historyRepository.save(history);

        return convertToDTO(updatedOrder);
    }

    public void cancelOrder(Long orderId, Long agentId, String remarks) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Service order not found with ID: " + orderId));

        String oldStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : null;
        order.setOrderStatus(OrderStatus.CANCELLED);
        if (remarks != null) order.setApprovalRemarks(remarks);

        ServiceAgent agent = agentId != null ? serviceAgentRepository.findById(agentId).orElse(null) : null;
        if (agent != null) order.setReviewedBy(agent);

        // Release allocated resources if any
        List<ResourceAllocation> allocations = allocationRepository.findByServiceOrderOrderId(orderId);
        for (ResourceAllocation alloc : allocations) {
            if (alloc.getReleasedAt() == null) {
                alloc.setReleasedAt(LocalDateTime.now());
                allocationRepository.save(alloc);
                if (alloc.getNetworkResource() != null) {
                    alloc.getNetworkResource().setResourceStatus(com.j21.telecom.entity.NetworkResource.ResourceStatus.AVAILABLE);
                    resourceRepository.save(alloc.getNetworkResource());
                }
            }
        }

        serviceOrderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setServiceOrder(order);
        history.setChangedBy(agent != null ? agent : order.getReviewedBy());
        history.setOldStatus(oldStatus);
        history.setNewStatus(OrderStatus.CANCELLED.name());
        history.setRemarks(remarks != null ? remarks : "Service order cancelled");
        historyRepository.save(history);
    }

    public ServiceOrderResponseDTO convertToDTO(ServiceOrder order) {
        ServiceOrderResponseDTO dto = new ServiceOrderResponseDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderDate(order.getOrderDate());
        dto.setInstallationAddress(order.getInstallationAddress());
        dto.setOrderStatus(order.getOrderStatus() != null ? order.getOrderStatus().name() : "SUBMITTED");
        dto.setApprovalRemarks(order.getApprovalRemarks());

        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getCustomerId());
            if (order.getCustomer().getUser() != null) {
                dto.setCustomerName(order.getCustomer().getUser().getFullName());
            }
        }

        if (order.getServicePlan() != null) {
            dto.setPlanId(order.getServicePlan().getPlanId());
            dto.setPlanName(order.getServicePlan().getPlanName());
            dto.setPlanType(order.getServicePlan().getPlanType());
            dto.setMonthlyPrice(order.getServicePlan().getMonthlyPrice());
        }

        if (order.getReviewedBy() != null) {
            dto.setReviewedBy(order.getReviewedBy().getAgentId());
            if (order.getReviewedBy().getUser() != null) {
                dto.setReviewedByName(order.getReviewedBy().getUser().getFullName());
            }
        }

        return dto;
    }
}
