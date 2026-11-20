package com.j21.telecom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServiceOrderRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Service plan ID is required")
    private Long planId;

    @NotBlank(message = "Installation address is required")
    @Size(max = 255, message = "Installation address cannot exceed 255 characters")
    private String installationAddress;

    @Size(max = 500, message = "Approval remarks cannot exceed 500 characters")
    private String approvalRemarks;

    private Long reviewedBy;

    private String orderStatus;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public String getInstallationAddress() {
        return installationAddress;
    }

    public void setInstallationAddress(String installationAddress) {
        this.installationAddress = installationAddress;
    }

    public String getApprovalRemarks() {
        return approvalRemarks;
    }

    public void setApprovalRemarks(String approvalRemarks) {
        this.approvalRemarks = approvalRemarks;
    }

    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
}
