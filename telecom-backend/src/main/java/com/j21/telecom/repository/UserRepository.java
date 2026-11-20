
package com.j21.telecom.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    User findByEmail(String email);

    List<User> findByRoleRoleName(String roleName);
}
