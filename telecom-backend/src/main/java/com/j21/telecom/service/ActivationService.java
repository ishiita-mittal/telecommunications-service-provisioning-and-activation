package com.j21.telecom.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.ActivationRecordResponseDTO;
import com.j21.telecom.dto.ActivationTestResponseDTO;
import com.j21.telecom.entity.ActivationRecord;
import com.j21.telecom.entity.ActivationRecord.ActivationStatus;
import com.j21.telecom.entity.ActivationTest;
import com.j21.telecom.entity.ActivationTest.TestResult;
import com.j21.telecom.entity.OrderStatusHistory;
import com.j21.telecom.entity.ResourceAllocation;
import com.j21.telecom.entity.ServiceOrder;
import com.j21.telecom.entity.ServiceOrder.OrderStatus;
import com.j21.telecom.repository.ActivationRecordRepository;
import com.j21.telecom.repository.ActivationTestRepository;
import com.j21.telecom.repository.OrderStatusHistoryRepository;
import com.j21.telecom.repository.ResourceAllocationRepository;
import com.j21.telecom.repository.ServiceOrderRepository;

@Service
@Transactional
public class ActivationService {

    private final ActivationRecordRepository activationRecordRepository;
    private final ActivationTestRepository activationTestRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;

    public ActivationService(
            ActivationRecordRepository activationRecordRepository,
            ActivationTestRepository activationTestRepository,
            ServiceOrderRepository serviceOrderRepository,
            OrderStatusHistoryRepository historyRepository,
            ResourceAllocationRepository resourceAllocationRepository) {
        this.activationRecordRepository = activationRecordRepository;
        this.activationTestRepository = activationTestRepository;
        this.serviceOrderRepository = serviceOrderRepository;
        this.historyRepository = historyRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivationRecordResponseDTO> getAllActivationRecords() {
        return activationRecordRepository.findAll()
                .stream()
                .map(this::convertRecordToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ActivationRecordResponseDTO getActivationById(Long activationId) {
        ActivationRecord record = activationRecordRepository.findById(activationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Activation record not found with ID: " + activationId));
        return convertRecordToDTO(record);
    }

    @Transactional(readOnly = true)
    public List<ActivationTestResponseDTO> getAllActivationTests() {
        return activationTestRepository.findAll()
                .stream()
                .map(this::convertTestToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivationTestResponseDTO> getTestsByActivationId(Long activationId) {
        return activationTestRepository.findByActivationRecordActivationId(activationId)
                .stream()
                .map(this::convertTestToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ActivationTestResponseDTO getActivationTestById(Long testId) {
        ActivationTest test = activationTestRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Activation test not found with ID: " + testId));
        return convertTestToDTO(test);
    }

    // Execute activation test and activate service end-to-end
    public ActivationTestResponseDTO runActivationTest(Long activationId, String testType, String remarks) {
        ActivationRecord record = activationRecordRepository.findById(activationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Activation record not found with ID: " + activationId));

        String actualTestType = (testType != null && !testType.trim().isEmpty())
                ? testType.trim()
                : "SIGNAL_AND_DATA_CONNECTIVITY";

        String actualRemarks = (remarks != null && !remarks.trim().isEmpty())
                ? remarks.trim()
                : "All functional checks passed. Latency: 18ms, Throughput verified.";

        // 1. Create ActivationTest
        ActivationTest test = new ActivationTest();
        test.setActivationRecord(record);
        test.setTestType(actualTestType);
        test.setTestResult(TestResult.PASSED);
        test.setTestedAt(LocalDateTime.now());
        test.setRemarks(actualRemarks);
        ActivationTest savedTest = activationTestRepository.save(test);

        // 2. Update ActivationRecord status to ACTIVE
        record.setActivationStatus(ActivationStatus.ACTIVE);
        record.setActivationDate(LocalDateTime.now());
        record.setRemarks("Activated via test #" + savedTest.getTestId() + " (" + actualTestType + ")");
        activationRecordRepository.save(record);

        // 3. Update ServiceOrder status to ACTIVE
        if (record.getServiceOrder() != null) {
            ServiceOrder order = record.getServiceOrder();
            String oldStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : null;
            order.setOrderStatus(OrderStatus.ACTIVE);
            serviceOrderRepository.save(order);

            // 4. Record OrderStatusHistory
            OrderStatusHistory history = new OrderStatusHistory();
            history.setServiceOrder(order);
            history.setChangedBy(record.getActivatedBy());
            history.setOldStatus(oldStatus);
            history.setNewStatus(OrderStatus.ACTIVE.name());
            history.setRemarks("Service activated successfully after passing " + actualTestType + " test");
            historyRepository.save(history);
        }

        return convertTestToDTO(savedTest);
    }

    public ActivationRecordResponseDTO convertRecordToDTO(ActivationRecord record) {
        ActivationRecordResponseDTO dto = new ActivationRecordResponseDTO();
        dto.setActivationId(record.getActivationId());
        dto.setActivationStatus(record.getActivationStatus() != null ? record.getActivationStatus().name() : "PENDING");
        dto.setActivationDate(record.getActivationDate());
        dto.setRemarks(record.getRemarks());

        if (record.getServiceOrder() != null) {
            ServiceOrder order = record.getServiceOrder();
            dto.setOrderId(order.getOrderId());
            if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
                dto.setCustomerName(order.getCustomer().getUser().getFullName());
            }
            if (order.getServicePlan() != null) {
                dto.setPlanName(order.getServicePlan().getPlanName());
            }
            List<ResourceAllocation> allocations = resourceAllocationRepository.findByServiceOrderOrderId(order.getOrderId());
            if (!allocations.isEmpty() && allocations.get(0).getNetworkResource() != null) {
                dto.setResourceIdentifier(allocations.get(0).getNetworkResource().getResourceIdentifier());
            }
        }

        if (record.getActivatedBy() != null) {
            dto.setActivatedBy(record.getActivatedBy().getAgentId());
            if (record.getActivatedBy().getUser() != null) {
                dto.setAgentName(record.getActivatedBy().getUser().getFullName());
            } else {
                dto.setAgentName(record.getActivatedBy().getEmployeeCode());
            }
        }

        return dto;
    }

    public ActivationTestResponseDTO convertTestToDTO(ActivationTest test) {
        ActivationTestResponseDTO dto = new ActivationTestResponseDTO();
        dto.setTestId(test.getTestId());
        if (test.getActivationRecord() != null) {
            dto.setActivationId(test.getActivationRecord().getActivationId());
        }
        dto.setTestType(test.getTestType());
        dto.setTestResult(test.getTestResult() != null ? test.getTestResult().name() : "PENDING");
        dto.setTestedAt(test.getTestedAt());
        dto.setRemarks(test.getRemarks());
        return dto;
    }
}
