package com.j21.telecom.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String roleName);
}