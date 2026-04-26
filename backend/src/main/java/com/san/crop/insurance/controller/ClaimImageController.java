package com.san.crop.insurance.controller;

import com.san.crop.insurance.dto.AIResponse;
import com.san.crop.insurance.model.Claim;
import com.san.crop.insurance.model.InsurancePolicy;
import com.san.crop.insurance.repository.ClaimRepository;
import com.san.crop.insurance.repository.InsurancePolicyRepository;
import com.san.crop.insurance.service.AIIntegrationService;
import com.san.crop.insurance.service.PdfGeneratorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/claims")
public class ClaimImageController {

    private final InsurancePolicyRepository insurancePolicyRepository;
    private final ClaimRepository claimRepository;
    private final AIIntegrationService aiIntegrationService;
    private final PdfGeneratorService pdfGeneratorService;

    public ClaimImageController(InsurancePolicyRepository insurancePolicyRepository,
                                ClaimRepository claimRepository,
                                AIIntegrationService aiIntegrationService,
                                PdfGeneratorService pdfGeneratorService) {
        this.insurancePolicyRepository = insurancePolicyRepository;
        this.claimRepository = claimRepository;
        this.aiIntegrationService = aiIntegrationService;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @PostMapping(value = "/process-with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<Claim> processClaimWithImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("policyId") Long policyId,
            @RequestParam(value = "fieldDataId", required = false) Long fieldDataId
    ) {
        try {
            // 1) Save image to disk (keep your existing logic / path)
            Path uploadDir = Paths.get("uploaded_images");
            Files.createDirectories(uploadDir);
            Path imagePath = uploadDir.resolve(image.getOriginalFilename());
            Files.write(imagePath, image.getBytes());

            // 2) Fetch policy (assumes existing logic)
            InsurancePolicy policy = insurancePolicyRepository.findById(policyId)
                    .orElseThrow(() -> new RuntimeException("Policy not found"));

            // 3) Call AI Flask server
            AIResponse aiResponse = aiIntegrationService.analyzeImage(image);

            // 4) Build Claim (reuse your existing calculation logic as needed)
            Claim claim = Claim.builder()
                    .insurancePolicy(policy)
                    .causeOfLoss(aiResponse != null ? aiResponse.getDisease() : "IMAGE_ANALYSIS")
                    .wetnessIndex(0.0)
                    .diseaseDetected(aiResponse != null ? aiResponse.getDisease() : null)
                    .detectedDisease(aiResponse != null ? aiResponse.getDisease() : null)
                    .recommendedRemedy(aiResponse != null ? aiResponse.getRemedy() : null)
                    .confidenceScore(aiResponse != null ? aiResponse.getConfidence() : null)
                    .detectionSource("IMAGE")
                    // you can still compute severity / fraud / amount with your existing services
                    .severity("MEDIUM")
                    .fraudScore(0)
                    .claimAmount(0.0)
                    .status(com.san.crop.insurance.model.ClaimStatus.PENDING)
                    .blockchainHash(null)
                    .build();

            Claim savedClaim = claimRepository.save(claim);

            // 5) Generate PDF including new fields
            String pdfPath = pdfGeneratorService.generateClaimPdf(savedClaim);
            savedClaim.setPdfPath(pdfPath);
            savedClaim = claimRepository.save(savedClaim);

            return new ResponseEntity<>(savedClaim, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process claim with image", e);
        }
    }
}