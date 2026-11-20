package com.j21.telecom;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.j21.telecom.dto.CustomerRequestDTO;
import com.j21.telecom.dto.CustomerResponseDTO;
import com.j21.telecom.dto.ServiceAgentRequestDTO;
import com.j21.telecom.dto.ServiceAgentResponseDTO;
import com.j21.telecom.dto.ServicePlanRequestDTO;
import com.j21.telecom.dto.ServicePlanResponseDTO;
import com.j21.telecom.entity.ServiceAgent;
import com.j21.telecom.entity.ServicePlan;
import com.j21.telecom.service.CustomerService;
import com.j21.telecom.service.ServiceAgentService;
import com.j21.telecom.service.ServicePlanService;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ModulesIntegrationTest {

    @Autowired
    private ServicePlanService servicePlanService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ServiceAgentService serviceAgentService;

    private static Long createdPlanId;
    private static Long createdCustomerId;
    private static Long createdAgentId;

    // --- SERVICE PLANS TESTS ---

    @Test
    @Order(1)
    void testCreateServicePlan() {
        ServicePlanRequestDTO dto = new ServicePlanRequestDTO();
        dto.setPlanName("Ultra 5G Speedster");
        dto.setPlanType("MOBILE");
        dto.setDescription("High speed 5G test plan");
        dto.setMonthlyPrice(new BigDecimal("799.00"));
        dto.setDataLimitGb(new BigDecimal("150.00"));
        dto.setValidityDays(30);
        dto.setIsAvailable(true);

        ServicePlan created = servicePlanService.createPlan(dto);
        assertNotNull(created);
        assertNotNull(created.getPlanId());
        assertNotNull(created.getCreatedAt(), "createdAt must be set by @PrePersist");
        assertEquals("Ultra 5G Speedster", created.getPlanName());
        createdPlanId = created.getPlanId();
    }

    @Test
    @Order(2)
    void testGetAllServicePlans() {
        List<ServicePlan> plans = servicePlanService.getAllPlans();
        assertNotNull(plans);
        assertTrue(plans.size() >= 10, "Should include seeded plans plus created plan");
    }

    @Test
    @Order(3)
    void testUpdateServicePlan() {
        assertNotNull(createdPlanId);
        ServicePlanRequestDTO updateDto = new ServicePlanRequestDTO();
        updateDto.setPlanName("Ultra 5G Speedster Updated");
        updateDto.setPlanType("MOBILE");
        updateDto.setDescription("Updated description");
        updateDto.setMonthlyPrice(new BigDecimal("849.00"));
        updateDto.setDataLimitGb(new BigDecimal("200.00"));
        updateDto.setValidityDays(30);
        updateDto.setIsAvailable(true);

        ServicePlan updated = servicePlanService.updatePlan(createdPlanId, updateDto);
        assertEquals("Ultra 5G Speedster Updated", updated.getPlanName());
        assertEquals(new BigDecimal("849.00"), updated.getMonthlyPrice());
    }

    @Test
    @Order(4)
    void testDeleteServicePlan() {
        assertNotNull(createdPlanId);
        servicePlanService.deletePlan(createdPlanId);
        assertThrows(Exception.class, () -> servicePlanService.getPlanById(createdPlanId));
    }

    // --- CUSTOMERS TESTS ---

    @Test
    @Order(5)
    void testGetAllCustomers() {
        List<CustomerResponseDTO> customers = customerService.getAllCustomers();
        assertNotNull(customers);
        assertTrue(customers.size() >= 10, "Should contain seeded customers");
    }

    @Test
    @Order(6)
    void testCreateCustomerWithNewUser() {
        CustomerRequestDTO dto = new CustomerRequestDTO();
        dto.setFullName("Test Integration Customer");
        dto.setEmail("test.customer." + System.currentTimeMillis() + "@telecomtest.com");
        dto.setPhone("9812345678");
        dto.setAddress("42 Alpha Street");
        dto.setCity("Gurugram");
        dto.setState("Haryana");
        dto.setPincode("122001");
        dto.setKycStatus("VERIFIED");

        CustomerResponseDTO created = customerService.createCustomer(dto);
        assertNotNull(created);
        assertNotNull(created.getCustomerId());
        assertNotNull(created.getUserId());
        assertEquals("Test Integration Customer", created.getFullName());
        assertEquals("Gurugram", created.getCity());
        assertEquals("VERIFIED", created.getKycStatus());
        createdCustomerId = created.getCustomerId();
    }

    @Test
    @Order(7)
    void testUpdateCustomer() {
        assertNotNull(createdCustomerId);
        CustomerRequestDTO updateDto = new CustomerRequestDTO();
        updateDto.setFullName("Test Customer Modified");
        updateDto.setCity("Faridabad");
        updateDto.setAddress("99 Beta Road");
        updateDto.setPincode("121002");
        updateDto.setKycStatus("VERIFIED");

        CustomerResponseDTO updated = customerService.updateCustomer(createdCustomerId, updateDto);
        assertEquals("Test Customer Modified", updated.getFullName());
        assertEquals("Faridabad", updated.getCity());
    }

    // --- SERVICE AGENTS TESTS ---

    @Test
    @Order(8)
    void testGetAllAgents() {
        List<ServiceAgent> agents = serviceAgentService.getAllAgents();
        assertNotNull(agents);
        assertTrue(agents.size() >= 10, "Should contain seeded agents");
    }

    @Test
    @Order(9)
    void testCreateAgentWithNewUser() {
        String code = "J21-TEST" + (System.currentTimeMillis() % 10000);
        ServiceAgentRequestDTO dto = new ServiceAgentRequestDTO();
        dto.setFullName("Test Integration Agent");
        dto.setEmail("agent." + System.currentTimeMillis() + "@j21test.com");
        dto.setPhone("9899887766");
        dto.setEmployeeCode(code);
        dto.setDepartment("Network Operations");

        ServiceAgent agent = serviceAgentService.createAgent(dto);
        assertNotNull(agent);
        assertNotNull(agent.getAgentId());
        assertEquals(code, agent.getEmployeeCode());
        assertEquals("Network Operations", agent.getDepartment());
        createdAgentId = agent.getAgentId();
    }

    @Test
    @Order(10)
    void testUpdateAgent() {
        assertNotNull(createdAgentId);
        ServiceAgentRequestDTO dto = new ServiceAgentRequestDTO();
        dto.setDepartment("Customer Escalations");
        dto.setFullName("Test Agent Renamed");

        ServiceAgent updated = serviceAgentService.updateAgent(createdAgentId, dto);
        assertEquals("Customer Escalations", updated.getDepartment());
        assertEquals("Test Agent Renamed", updated.getUser().getFullName());
    }

    @Test
    @Order(11)
    void testDeleteAgent() {
        assertNotNull(createdAgentId);
        serviceAgentService.deleteAgent(createdAgentId);
        assertThrows(Exception.class, () -> serviceAgentService.getAgentById(createdAgentId));
    }
}
