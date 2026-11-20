package com.j21.telecom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.j21.telecom.dto.ActivationRecordResponseDTO;
import com.j21.telecom.dto.ActivationTestResponseDTO;
import com.j21.telecom.service.ActivationService;

@RestController
@RequestMapping("/api/activation")
public class ActivationController {

    private final ActivationService activationService;

    public ActivationController(ActivationService activationService) {
        this.activationService = activationService;
    }

    @GetMapping("/records")
    public ResponseEntity<List<ActivationRecordResponseDTO>> getAllActivationRecords() {
        return ResponseEntity.ok(activationService.getAllActivationRecords());
    }

    @GetMapping("/records/{activationId}")
    public ResponseEntity<ActivationRecordResponseDTO> getActivationById(@PathVariable Long activationId) {
        return ResponseEntity.ok(activationService.getActivationById(activationId));
    }

    @GetMapping("/records/{activationId}/tests")
    public ResponseEntity<List<ActivationTestResponseDTO>> getTestsByActivationId(@PathVariable Long activationId) {
        return ResponseEntity.ok(activationService.getTestsByActivationId(activationId));
    }

    @GetMapping("/tests")
    public ResponseEntity<List<ActivationTestResponseDTO>> getAllActivationTests() {
        return ResponseEntity.ok(activationService.getAllActivationTests());
    }

    @GetMapping("/tests/{testId}")
    public ResponseEntity<ActivationTestResponseDTO> getActivationTestById(@PathVariable Long testId) {
        return ResponseEntity.ok(activationService.getActivationTestById(testId));
    }

    @PostMapping("/records/{activationId}/test")
    public ResponseEntity<ActivationTestResponseDTO> runActivationTest(
            @PathVariable Long activationId,
            @RequestParam(required = false) String testType,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(activationService.runActivationTest(activationId, testType, remarks));
    }
}
