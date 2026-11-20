
package com.j21.telecom.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "provisioning_tasks")
@Getter
@Setter
public class ProvisioningTask {

    public enum TaskStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private ServiceOrder serviceOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent")
    private ServiceAgent assignedAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_status")
    private TaskStatus taskStatus = TaskStatus.PENDING;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (taskStatus == null) {
            taskStatus = TaskStatus.PENDING;
        }
    }
}
