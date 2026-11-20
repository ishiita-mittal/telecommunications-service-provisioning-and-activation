package com.j21.telecom.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {

    private long totalCustomers;
    private long totalOrders;
    private long activePlans;
    private long activatedServices;
    private List<ServiceOrderResponseDTO> recentOrders;
    private Map<String, Long> provisioningStatusSummary;
    private Map<String, Long> resourceStatusSummary;

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getActivePlans() {
        return activePlans;
    }

    public void setActivePlans(long activePlans) {
        this.activePlans = activePlans;
    }

    public long getActivatedServices() {
        return activatedServices;
    }

    public void setActivatedServices(long activatedServices) {
        this.activatedServices = activatedServices;
    }

    public List<ServiceOrderResponseDTO> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<ServiceOrderResponseDTO> recentOrders) {
        this.recentOrders = recentOrders;
    }

    public Map<String, Long> getProvisioningStatusSummary() {
        return provisioningStatusSummary;
    }

    public void setProvisioningStatusSummary(Map<String, Long> provisioningStatusSummary) {
        this.provisioningStatusSummary = provisioningStatusSummary;
    }

    public Map<String, Long> getResourceStatusSummary() {
        return resourceStatusSummary;
    }

    public void setResourceStatusSummary(Map<String, Long> resourceStatusSummary) {
        this.resourceStatusSummary = resourceStatusSummary;
    }
}
