package com.j21.telecom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.j21.telecom.dto.ServiceOrderRequestDTO;
import com.j21.telecom.dto.ServiceOrderResponseDTO;
import com.j21.telecom.service.ServiceOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;

    public ServiceOrderController(ServiceOrderService serviceOrderService) {
        this.serviceOrderService = serviceOrderService;
    }

    // Get all orders
    @GetMapping
    public ResponseEntity<List<ServiceOrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(serviceOrderService.getAllOrders());
    }

    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<ServiceOrderResponseDTO> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(serviceOrderService.getOrderById(orderId));
    }

    // Get orders by customer ID
    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<List<ServiceOrderResponseDTO>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(serviceOrderService.getOrdersByCustomer(customerId));
    }

    // Get orders by status
    @GetMapping("/by-status")
    public ResponseEntity<List<ServiceOrderResponseDTO>> getOrdersByStatus(@RequestParam String status) {
        return ResponseEntity.ok(serviceOrderService.getOrdersByStatus(status));
    }

    // Create a new service order
    @PostMapping
    public ResponseEntity<ServiceOrderResponseDTO> createOrder(@Valid @RequestBody ServiceOrderRequestDTO dto) {
        ServiceOrderResponseDTO created = serviceOrderService.createOrder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update order status (with optional reviewing agent & remarks)
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ServiceOrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String remarks) {
        ServiceOrderResponseDTO updated = serviceOrderService.updateOrderStatus(orderId, status, agentId, remarks);
        return ResponseEntity.ok(updated);
    }

    // Cancel order
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String remarks) {
        serviceOrderService.cancelOrder(orderId, agentId, remarks);
        return ResponseEntity.noContent().build();
    }
}
