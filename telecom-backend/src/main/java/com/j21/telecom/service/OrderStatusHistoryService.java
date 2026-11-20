package com.j21.telecom.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.OrderStatusHistoryResponseDTO;
import com.j21.telecom.entity.OrderStatusHistory;
import com.j21.telecom.repository.OrderStatusHistoryRepository;

@Service
@Transactional(readOnly = true)
public class OrderStatusHistoryService {

    private final OrderStatusHistoryRepository historyRepository;

    public OrderStatusHistoryService(OrderStatusHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public List<OrderStatusHistoryResponseDTO> getAllHistory() {
        return historyRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderStatusHistoryResponseDTO getHistoryById(Long historyId) {
        OrderStatusHistory h = historyRepository.findById(historyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order status history not found with ID: " + historyId));
        return convertToDTO(h);
    }

    public List<OrderStatusHistoryResponseDTO> getHistoryByOrderId(Long orderId) {
        return historyRepository.findByServiceOrderOrderId(orderId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderStatusHistoryResponseDTO convertToDTO(OrderStatusHistory h) {
        OrderStatusHistoryResponseDTO dto = new OrderStatusHistoryResponseDTO();
        dto.setHistoryId(h.getHistoryId());
        dto.setOldStatus(h.getOldStatus());
        dto.setNewStatus(h.getNewStatus());
        dto.setRemarks(h.getRemarks());
        dto.setChangedAt(h.getChangedAt());

        if (h.getServiceOrder() != null) {
            dto.setOrderId(h.getServiceOrder().getOrderId());
        }

        if (h.getChangedBy() != null) {
            dto.setChangedBy(h.getChangedBy().getAgentId());
            if (h.getChangedBy().getUser() != null) {
                dto.setAgentName(h.getChangedBy().getUser().getFullName());
            } else {
                dto.setAgentName(h.getChangedBy().getEmployeeCode());
            }
        }

        return dto;
    }
}
