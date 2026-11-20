
package com.j21.telecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.j21.telecom.entity.ActivationTest;

import java.util.List;

public interface ActivationTestRepository
        extends JpaRepository<ActivationTest, Long> {

    List<ActivationTest> findByActivationRecordActivationId(Long activationId);

    List<ActivationTest> findByTestResult(ActivationTest.TestResult testResult);
}
