package com.j21.telecom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.j21.telecom.dto.NetworkResourceRequestDTO;
import com.j21.telecom.dto.NetworkResourceResponseDTO;
import com.j21.telecom.service.NetworkResourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class NetworkResourceController {

    private final NetworkResourceService networkResourceService;

    public NetworkResourceController(NetworkResourceService networkResourceService) {
        this.networkResourceService = networkResourceService;
    }

    @GetMapping
    public ResponseEntity<List<NetworkResourceResponseDTO>> getAllResources() {
        return ResponseEntity.ok(networkResourceService.getAllResources());
    }

    @GetMapping("/available")
    public ResponseEntity<List<NetworkResourceResponseDTO>> getAvailableResources() {
        return ResponseEntity.ok(networkResourceService.getAvailableResources());
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<NetworkResourceResponseDTO> getResourceById(@PathVariable Long resourceId) {
        return ResponseEntity.ok(networkResourceService.getResourceById(resourceId));
    }

    @PostMapping
    public ResponseEntity<NetworkResourceResponseDTO> createResource(@Valid @RequestBody NetworkResourceRequestDTO dto) {
        NetworkResourceResponseDTO created = networkResourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{resourceId}")
    public ResponseEntity<NetworkResourceResponseDTO> updateResource(
            @PathVariable Long resourceId,
            @RequestBody NetworkResourceRequestDTO dto) {
        NetworkResourceResponseDTO updated = networkResourceService.updateResource(resourceId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long resourceId) {
        networkResourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }
}
