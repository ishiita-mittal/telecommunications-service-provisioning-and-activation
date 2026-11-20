
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ServiceAgent;

public interface ServiceAgentRepository
        extends JpaRepository<ServiceAgent, Long> {

    ServiceAgent findByUserUserId(Long userId);

    boolean existsByEmployeeCode(String employeeCode);
}
