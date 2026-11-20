
package com.j21.telecom.dto;

import java.time.LocalDateTime;

public class ActivationRecordResponseDTO {

    private Long activationId;
    private Long orderId;
    private Long activatedBy;
    private String agentName;
    private String activationStatus;
    private LocalDateTime activationDate;
    private String remarks;
    private String customerName;
    private String planName;
    private String resourceIdentifier;

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getResourceIdentifier() {
        return resourceIdentifier;
    }

    public void setResourceIdentifier(String resourceIdentifier) {
        this.resourceIdentifier = resourceIdentifier;
    }

    public Long getActivationId() {
        return activationId;
    }

    public void setActivationId(Long activationId) {
        this.activationId = activationId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getActivatedBy() {
        return activatedBy;
    }

    public void setActivatedBy(Long activatedBy) {
        this.activatedBy = activatedBy;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getActivationStatus() {
        return activationStatus;
    }

    public void setActivationStatus(String activationStatus) {
        this.activationStatus = activationStatus;
    }

    public LocalDateTime getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(LocalDateTime activationDate) {
        this.activationDate = activationDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
