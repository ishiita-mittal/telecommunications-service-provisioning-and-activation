
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ResourceAllocation;

import java.util.List;

public interface ResourceAllocationRepository
        extends JpaRepository<ResourceAllocation, Long> {

    List<ResourceAllocation> findByServiceOrderOrderId(Long orderId);

    List<ResourceAllocation> findByNetworkResourceResourceId(Long resourceId);
}
