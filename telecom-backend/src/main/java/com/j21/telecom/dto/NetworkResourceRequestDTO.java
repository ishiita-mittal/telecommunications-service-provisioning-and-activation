
package com.j21.telecom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NetworkResourceRequestDTO {

    @NotBlank(message = "Resource type is required")
    @Size(max = 60, message = "Resource type cannot exceed 60 characters")
    private String resourceType;

    @NotBlank(message = "Resource identifier is required")
    @Size(max = 100, message = "Resource identifier cannot exceed 100 characters")
    private String resourceIdentifier;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceIdentifier() {
        return resourceIdentifier;
    }

    public void setResourceIdentifier(String resourceIdentifier) {
        this.resourceIdentifier = resourceIdentifier;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
