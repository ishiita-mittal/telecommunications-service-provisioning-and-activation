
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ProvisioningTask;

import java.util.List;

public interface ProvisioningTaskRepository
        extends JpaRepository<ProvisioningTask, Long> {

    List<ProvisioningTask> findByServiceOrderOrderId(Long orderId);

    List<ProvisioningTask> findByTaskStatus(
            ProvisioningTask.TaskStatus taskStatus);

    long countByTaskStatus(ProvisioningTask.TaskStatus taskStatus);
}
