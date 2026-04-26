package com.san.crop.insurance.repository;

import com.san.crop.insurance.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    // ✅ METHOD 1: Spring Data derived query (works if InsurancePolicy has @ManyToOne Farmer farmer)
    List<Claim> findByInsurancePolicy_Farmer_Id(Long farmerId);

    // ✅ METHOD 2: Explicit JPQL — works regardless of exact field names
    @Query("SELECT c FROM Claim c WHERE c.insurancePolicy.farmer.id = :farmerId")
    List<Claim> findClaimsByFarmerId(@Param("farmerId") Long farmerId);

    // ✅ METHOD 3: Native SQL — absolute fallback, bypasses all JPA mapping
    @Query(value = """
        SELECT c.* FROM claims c
        JOIN insurance_policies ip ON c.insurance_policy_id = ip.id
        JOIN farmers f ON ip.farmer_id = f.id
        WHERE f.id = :farmerId
        ORDER BY c.id DESC
        """, nativeQuery = true)
    List<Claim> findClaimsByFarmerIdNative(@Param("farmerId") Long farmerId);
}