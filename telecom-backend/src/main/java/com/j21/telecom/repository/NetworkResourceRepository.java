
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.NetworkResource;

import java.util.List;

public interface NetworkResourceRepository
        extends JpaRepository<NetworkResource, Long> {

    List<NetworkResource> findByResourceStatus(
            NetworkResource.ResourceStatus resourceStatus);

    long countByResourceStatus(NetworkResource.ResourceStatus resourceStatus);

    boolean existsByResourceIdentifier(String resourceIdentifier);
}
