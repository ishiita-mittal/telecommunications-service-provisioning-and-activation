package com.j21.telecom.dto;

import jakarta.validation.constraints.Size;

public class ServiceAgentRequestDTO {

    private Long userId;

    private String fullName;

    private String email;

    private String phone;

    @Size(max = 50, message = "Employee code cannot exceed 50 characters")
    private String employeeCode;

    @Size(max = 80, message = "Department cannot exceed 80 characters")
    private String department;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
