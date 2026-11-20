package com.j21.telecom.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.j21.telecom.dto.OrderStatusHistoryResponseDTO;
import com.j21.telecom.service.OrderStatusHistoryService;

@RestController
@RequestMapping("/api/order-history")
public class OrderStatusHistoryController {

    private final OrderStatusHistoryService historyService;

    public OrderStatusHistoryController(OrderStatusHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<OrderStatusHistoryResponseDTO>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @GetMapping("/{historyId}")
    public ResponseEntity<OrderStatusHistoryResponseDTO> getHistoryById(@PathVariable Long historyId) {
        return ResponseEntity.ok(historyService.getHistoryById(historyId));
    }

    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<List<OrderStatusHistoryResponseDTO>> getHistoryByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(historyService.getHistoryByOrderId(orderId));
    }
}
