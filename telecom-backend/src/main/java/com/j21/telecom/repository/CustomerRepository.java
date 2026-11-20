
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Customer findByUserUserId(Long userId);
}
