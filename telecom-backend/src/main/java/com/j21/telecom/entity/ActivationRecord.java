
package com.j21.telecom.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "activation_records")
@Getter
@Setter
public class ActivationRecord {

    public enum ActivationStatus {
        PENDING,
        IN_PROGRESS,
        ACTIVE,
        FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activation_id")
    private Long activationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private ServiceOrder serviceOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activated_by")
    private ServiceAgent activatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "activation_status")
    private ActivationStatus activationStatus = ActivationStatus.PENDING;

    @Column(name = "activation_date")
    private LocalDateTime activationDate;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @PrePersist
    public void prePersist() {
        if (this.activationStatus == ActivationStatus.ACTIVE && this.activationDate == null) {
            this.activationDate = LocalDateTime.now();
        }
    }
}
