
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ActivationRecord;

import java.util.List;
import java.util.Optional;

public interface ActivationRecordRepository
        extends JpaRepository<ActivationRecord, Long> {

    Optional<ActivationRecord> findByServiceOrderOrderId(Long orderId);

    List<ActivationRecord> findByActivationStatus(
            ActivationRecord.ActivationStatus activationStatus);

    long countByActivationStatus(ActivationRecord.ActivationStatus activationStatus);
}
