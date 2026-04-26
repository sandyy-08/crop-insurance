package com.san.crop.insurance.controller;

import com.san.crop.insurance.model.InsurancePolicy;
import com.san.crop.insurance.repository.InsurancePolicyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "*")
public class PolicyController {

    private final InsurancePolicyRepository insurancePolicyRepository;

    public PolicyController(InsurancePolicyRepository insurancePolicyRepository) {
        this.insurancePolicyRepository = insurancePolicyRepository;
    }

    @GetMapping
    public ResponseEntity<List<InsurancePolicy>> getAllPolicies(
            @RequestParam(value = "farmerId", required = false) Long farmerId) {

        if (farmerId != null) {
            // ✅ ImageUpload dropdown only shows THIS farmer's own policies
            List<InsurancePolicy> mine = insurancePolicyRepository.findByFarmerId(farmerId);
            return ResponseEntity.ok(mine);
        }

        return ResponseEntity.ok(insurancePolicyRepository.findAll());
    }
}