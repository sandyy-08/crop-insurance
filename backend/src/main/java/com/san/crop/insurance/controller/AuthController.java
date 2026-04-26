package com.san.crop.insurance.controller;

import com.san.crop.insurance.model.Farmer;
import com.san.crop.insurance.model.InsurancePolicy;
import com.san.crop.insurance.repository.FarmerRepository;
import com.san.crop.insurance.repository.InsurancePolicyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final FarmerRepository farmerRepository;
    private final InsurancePolicyRepository insurancePolicyRepository;

    public AuthController(FarmerRepository farmerRepository,
                          InsurancePolicyRepository insurancePolicyRepository) {
        this.farmerRepository = farmerRepository;
        this.insurancePolicyRepository = insurancePolicyRepository;
    }

    // ── REGISTER ──────────────────────────────────────────────────────────
    // 1. Saves farmer record
    // 2. Auto-creates a default InsurancePolicy so dashboard works immediately
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        // Reject duplicate email
        if (farmerRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }

        // Step 1 — Save farmer
        Farmer farmer = Farmer.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(req.getPassword())     // TODO: hash with BCrypt in production
                .farmerId(req.getFarmerId())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .village(req.getVillage())
                .district(req.getDistrict())
                .build();

        Farmer savedFarmer = farmerRepository.save(farmer);

        // Step 2 — Auto-create a default policy linked to this farmer
        // This ensures GET /api/claims?farmerId=X returns data immediately
        // instead of showing "No policy found" error
        try {
            InsurancePolicy defaultPolicy = InsurancePolicy.builder()
                    .farmer(savedFarmer)
                    .policyNumber("PMFBY-" + savedFarmer.getId() + "-2025")
                    .cropType("Rice")           // Default crop — farmer can update later
                    .sumInsured(50000.0)        // ₹50,000 default coverage
                    .areaInsured(2.0)           // 2 acres default
                    .thresholdYield(2500.0)     // kg/hectare threshold
                    .build();

            insurancePolicyRepository.save(defaultPolicy);
        } catch (Exception e) {
            // If policy creation fails for any reason, still return the
            // saved farmer — don't fail the whole registration
            System.err.println("Warning: Could not auto-create policy for farmer "
                    + savedFarmer.getId() + ": " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedFarmer);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(req.getEmail());

        if (farmerOpt.isEmpty() || !farmerOpt.get().getPassword().equals(req.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        return ResponseEntity.ok(farmerOpt.get());
    }

    // ── DTOs ──────────────────────────────────────────────────────────────
    @lombok.Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String farmerId;
        private Double latitude;
        private Double longitude;
        private String village;
        private String district;
    }

    @lombok.Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}