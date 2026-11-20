
package com.j21.telecom.dto;

import java.time.LocalDateTime;

public class ActivationTestResponseDTO {

    private Long testId;
    private Long activationId;
    private String testType;
    private String testResult;
    private LocalDateTime testedAt;
    private String remarks;

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public Long getActivationId() {
        return activationId;
    }

    public void setActivationId(Long activationId) {
        this.activationId = activationId;
    }

    public String getTestType() {
        return testType;
    }

    public void setTestType(String testType) {
        this.testType = testType;
    }

    public String getTestResult() {
        return testResult;
    }

    public void setTestResult(String testResult) {
        this.testResult = testResult;
    }

    public LocalDateTime getTestedAt() {
        return testedAt;
    }

    public void setTestedAt(LocalDateTime testedAt) {
        this.testedAt = testedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
