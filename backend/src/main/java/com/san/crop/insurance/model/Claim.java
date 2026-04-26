package com.san.crop.insurance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String causeOfLoss;

    private double wetnessIndex;

    private String diseaseDetected;

    private String severity;

    private int fraudScore;

    private double claimAmount;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status;

    private String blockchainHash;
    private String pdfPath;

    // AI-based detection metadata
    private String detectedDisease;
   // private String remedy;
   private String recommendedRemedy;

    private Double confidenceScore;
    private String detectionSource; // SENSOR or IMAGE


    @ManyToOne
    @JoinColumn(name = "insurance_policy_id", nullable = false)
    private InsurancePolicy insurancePolicy;

    @Column(name = "photo_path", length = 512)
    private String photoPath;
}
