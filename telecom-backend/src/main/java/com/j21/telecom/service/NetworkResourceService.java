package com.j21.telecom.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.j21.telecom.dto.NetworkResourceRequestDTO;
import com.j21.telecom.dto.NetworkResourceResponseDTO;
import com.j21.telecom.entity.NetworkResource;
import com.j21.telecom.entity.NetworkResource.ResourceStatus;
import com.j21.telecom.repository.NetworkResourceRepository;

@Service
@Transactional
public class NetworkResourceService {

    private final NetworkResourceRepository networkResourceRepository;

    public NetworkResourceService(NetworkResourceRepository networkResourceRepository) {
        this.networkResourceRepository = networkResourceRepository;
    }

    @Transactional(readOnly = true)
    public List<NetworkResourceResponseDTO> getAllResources() {
        return networkResourceRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NetworkResourceResponseDTO getResourceById(Long resourceId) {
        NetworkResource resource = networkResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Network resource not found with ID: " + resourceId));
        return convertToDTO(resource);
    }

    @Transactional(readOnly = true)
    public List<NetworkResourceResponseDTO> getAvailableResources() {
        return networkResourceRepository
                .findByResourceStatus(ResourceStatus.AVAILABLE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public NetworkResourceResponseDTO createResource(NetworkResourceRequestDTO dto) {
        if (networkResourceRepository.existsByResourceIdentifier(dto.getResourceIdentifier().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Resource identifier already exists: " + dto.getResourceIdentifier());
        }

        NetworkResource resource = new NetworkResource();
        resource.setResourceType(dto.getResourceType().trim());
        resource.setResourceIdentifier(dto.getResourceIdentifier().trim());
        resource.setLocation(dto.getLocation());
        resource.setDescription(dto.getDescription());
        resource.setResourceStatus(ResourceStatus.AVAILABLE);

        NetworkResource saved = networkResourceRepository.save(resource);
        return convertToDTO(saved);
    }

    public NetworkResourceResponseDTO updateResource(Long resourceId, NetworkResourceRequestDTO dto) {
        NetworkResource resource = networkResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Network resource not found with ID: " + resourceId));

        if (dto.getResourceIdentifier() != null && !dto.getResourceIdentifier().trim().isEmpty()) {
            String identifier = dto.getResourceIdentifier().trim();
            if (networkResourceRepository.existsByResourceIdentifier(identifier)
                    && !resource.getResourceIdentifier().equalsIgnoreCase(identifier)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Resource identifier already exists: " + identifier);
            }
            resource.setResourceIdentifier(identifier);
        }

        if (dto.getResourceType() != null) resource.setResourceType(dto.getResourceType().trim());
        if (dto.getLocation() != null) resource.setLocation(dto.getLocation().trim());
        if (dto.getDescription() != null) resource.setDescription(dto.getDescription().trim());

        NetworkResource updated = networkResourceRepository.save(resource);
        return convertToDTO(updated);
    }

    public void deleteResource(Long resourceId) {
        NetworkResource resource = networkResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Network resource not found with ID: " + resourceId));
        networkResourceRepository.delete(resource);
    }

    public NetworkResourceResponseDTO convertToDTO(NetworkResource r) {
        NetworkResourceResponseDTO dto = new NetworkResourceResponseDTO();
        dto.setResourceId(r.getResourceId());
        dto.setResourceType(r.getResourceType());
        dto.setResourceIdentifier(r.getResourceIdentifier());
        dto.setResourceStatus(r.getResourceStatus() != null ? r.getResourceStatus().name() : "AVAILABLE");
        dto.setLocation(r.getLocation());
        dto.setDescription(r.getDescription());
        return dto;
    }
}
