
package com.j21.telecom.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "activation_tests")
@Getter
@Setter
public class ActivationTest {

    public enum TestResult {
        PENDING,
        PASSED,
        FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long testId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activation_id", nullable = false)
    private ActivationRecord activationRecord;

    @Column(name = "test_type", nullable = false, length = 80)
    private String testType;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_result")
    private TestResult testResult = TestResult.PENDING;

    @Column(name = "tested_at")
    private LocalDateTime testedAt;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @PrePersist
    public void prePersist() {
        if (this.testedAt == null) {
            this.testedAt = LocalDateTime.now();
        }
    }
}
