
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ServicePlan;

import java.util.List;

public interface ServicePlanRepository
        extends JpaRepository<ServicePlan, Long> {

    List<ServicePlan> findByIsAvailableTrue();

    long countByIsAvailableTrue();

    List<ServicePlan> findByPlanType(String planType);
}
