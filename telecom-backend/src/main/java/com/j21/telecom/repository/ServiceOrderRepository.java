
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ServiceOrder;

import java.util.List;

public interface ServiceOrderRepository
        extends JpaRepository<ServiceOrder, Long> {

    List<ServiceOrder> findByCustomerCustomerId(Long customerId);

    List<ServiceOrder> findByOrderStatus(ServiceOrder.OrderStatus orderStatus);

    long countByOrderStatus(ServiceOrder.OrderStatus orderStatus);

    List<ServiceOrder> findTop10ByOrderByOrderIdDesc();
}
