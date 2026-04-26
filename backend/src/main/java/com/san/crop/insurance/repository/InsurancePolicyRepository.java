package com.san.crop.insurance.repository;

import com.san.crop.insurance.model.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {
    //Optional<InsurancePolicy> findByFarmerId(Long farmerId);
    List<InsurancePolicy> findByFarmerId(Long farmerId);
}
