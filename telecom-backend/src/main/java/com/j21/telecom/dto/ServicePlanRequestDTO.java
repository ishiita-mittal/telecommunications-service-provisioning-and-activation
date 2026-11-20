package com.j21.telecom.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServicePlanRequestDTO {

    @NotBlank(message = "Plan name is required")
    @Size(max = 100)
    private String planName;

    @NotBlank(message = "Plan type is required")
    @Size(max = 50)
    private String planType;

    private String description;

    @NotNull(message = "Monthly price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal monthlyPrice;

    @DecimalMin(value = "0.0", message = "Data limit cannot be negative")
    private BigDecimal dataLimitGb;

    private Integer validityDays = 30;

    private Boolean isAvailable = true;

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public BigDecimal getDataLimitGb() {
        return dataLimitGb;
    }

    public void setDataLimitGb(BigDecimal dataLimitGb) {
        this.dataLimitGb = dataLimitGb;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}