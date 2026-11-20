
package com.j21.telecom.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "network_resources")
@Getter
@Setter
public class NetworkResource {

    public enum ResourceStatus {
        AVAILABLE,
        ALLOCATED,
        MAINTENANCE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "resource_type", nullable = false, length = 60)
    private String resourceType;

    @Column(name = "resource_identifier", nullable = false, unique = true, length = 100)
    private String resourceIdentifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_status")
    private ResourceStatus resourceStatus = ResourceStatus.AVAILABLE;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "description", length = 255)
    private String description;
}
