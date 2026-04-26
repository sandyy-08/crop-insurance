package com.san.crop.insurance.service;

import com.san.crop.insurance.dto.RemedyResponse;
import com.san.crop.insurance.model.Claim;
import com.san.crop.insurance.model.ClaimStatus;
import com.san.crop.insurance.model.FieldData;
import com.san.crop.insurance.model.InsurancePolicy;
import com.san.crop.insurance.repository.ClaimRepository;
import com.san.crop.insurance.repository.FieldDataRepository;
import com.san.crop.insurance.repository.InsurancePolicyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaimProcessingService {

    private final InsurancePolicyRepository insurancePolicyRepository;
    private final FieldDataRepository fieldDataRepository;
    private final ClaimRepository claimRepository;
    private final LeafWetnessService leafWetnessService;
    private final CauseClassificationService causeClassificationService;
    private final CompensationService compensationService;
    private final PdfGeneratorService pdfGeneratorService;
    private final FieldDataService fieldDataService;
    private final DiseaseDetectionService diseaseDetectionService;
    private final NaturalCauseService naturalCauseService;
    private final FraudDetectionService fraudDetectionService;
    private final IpWebcamService ipWebcamService;               // ← ADDED

    public ClaimProcessingService(InsurancePolicyRepository insurancePolicyRepository,
                                  FieldDataRepository fieldDataRepository,
                                  ClaimRepository claimRepository,
                                  LeafWetnessService leafWetnessService,
                                  CauseClassificationService causeClassificationService,
                                  CompensationService compensationService,
                                  PdfGeneratorService pdfGeneratorService,
                                  FieldDataService fieldDataService,
                                  DiseaseDetectionService diseaseDetectionService,
                                  NaturalCauseService naturalCauseService,
                                  FraudDetectionService fraudDetectionService,
                                  IpWebcamService ipWebcamService) {           // ← ADDED
        this.insurancePolicyRepository = insurancePolicyRepository;
        this.fieldDataRepository = fieldDataRepository;
        this.claimRepository = claimRepository;
        this.leafWetnessService = leafWetnessService;
        this.causeClassificationService = causeClassificationService;
        this.compensationService = compensationService;
        this.pdfGeneratorService = pdfGeneratorService;
        this.fieldDataService = fieldDataService;
        this.diseaseDetectionService = diseaseDetectionService;
        this.naturalCauseService = naturalCauseService;
        this.fraudDetectionService = fraudDetectionService;
        this.ipWebcamService = ipWebcamService;                  // ← ADDED
    }

    // ── Manual / header-button claim ─────────────────────────────────────
    public Claim processClaim(Long policyId, Long fieldDataId) {
        InsurancePolicy policy = insurancePolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        FieldData fieldData = fieldDataId == null
                ? fieldDataService.getLatestFieldData()
                : fieldDataRepository.findById(fieldDataId)
                .orElseThrow(() -> new RuntimeException("Field data not found"));

        double wetnessIndex = leafWetnessService.calculateWetnessIndex(
                fieldData.getHumidity(), fieldData.getRainStatus(),
                fieldData.getSoilMoisture(), fieldData.getTemperature());

        DiseaseDetectionService.DiseaseResult diseaseResult =
                diseaseDetectionService.detectDisease(
                        fieldData.getTemperature(),
                        fieldData.getHumidity(),
                        fieldData.getSoilMoisture());

        String naturalCause = naturalCauseService.classifyCause(
                fieldData.getRainStatus(), fieldData.getWaterLevel(),
                fieldData.getSoilMoisture(), fieldData.getHumidity());

        String severity = diseaseResult.getSeverity();

        double claimAmount = compensationService.calculateCompensation(
                policy.getSumInsured(), severity, policy.getThresholdYield());

        int fraudScore = fraudDetectionService.calculateFraudScore(
                claimAmount, wetnessIndex, policy.getThresholdYield());

        ClaimStatus status = fraudScore > 70 ? ClaimStatus.REJECTED
                : "HIGH".equalsIgnoreCase(severity) ? ClaimStatus.APPROVED
                : ClaimStatus.PENDING;

        Claim claim = Claim.builder()
                .insurancePolicy(policy)
                .causeOfLoss(naturalCause)
                .wetnessIndex(wetnessIndex)
                .diseaseDetected(diseaseResult.getDiseaseName())
                .severity(severity)
                .fraudScore(fraudScore)
                .claimAmount(claimAmount)
                .status(status)
                .blockchainHash(null)
                .build();

        Claim saved = claimRepository.save(claim);
        saved.setPdfPath(pdfGeneratorService.generateClaimPdf(saved));
        return claimRepository.save(saved);
    }

    // ── ESP32 auto-evaluate: NO farmerId (backward compatibility) ─────────
    public void autoEvaluateAndProcess(FieldData fieldData) {
        System.out.println("[AutoClaim] No farmerId provided — claim will not be linked to a farmer.");
        autoEvaluateAndProcess(fieldData, null);
    }

    // ── ESP32 / sensor auto-evaluate: WITH farmerId ───────────────────────
    public void autoEvaluateAndProcess(FieldData fieldData, Long farmerId) {
        if (fieldData == null) return;

        boolean floodRisk   = fieldData.getWaterLevel() > 80 || fieldData.getSoilMoisture() > 85;
        boolean droughtRisk = fieldData.getTemperature() > 38 && fieldData.getSoilMoisture() < 20;
        boolean diseaseRisk = fieldData.getHumidity() > 90 && fieldData.getTemperature() > 32;

        if (!floodRisk && !droughtRisk && !diseaseRisk) {
            System.out.println("[AutoClaim] Readings normal — no claim triggered.");
            return;
        }

        if (farmerId == null) {
            System.out.println("[AutoClaim] farmerId is null — skipping claim creation.");
            return;
        }

        List<InsurancePolicy> policies = insurancePolicyRepository.findByFarmerId(farmerId);
        if (policies.isEmpty()) {
            System.out.println("[AutoClaim] No policy found for farmerId=" + farmerId + " — skipping.");
            return;
        }
        InsurancePolicy policy = policies.get(0);

        String causeOfLoss = floodRisk ? "FLOOD" : droughtRisk ? "DROUGHT" : "HIGH_DISEASE_RISK";

        // ── CAPTURE PHOTO from IP Webcam when abnormal reading detected ──
        System.out.println("[AutoClaim] Abnormal: " + causeOfLoss + " — capturing field photo...");
        String photoPath = ipWebcamService.capturePhoto(farmerId, causeOfLoss);
        if (photoPath != null) {
            System.out.println("[AutoClaim] Photo saved at: " + photoPath);
        } else {
            System.out.println("[AutoClaim] Camera offline — proceeding without photo.");
        }

        double wetnessIndex = leafWetnessService.calculateWetnessIndex(
                fieldData.getHumidity(), fieldData.getRainStatus(),
                fieldData.getSoilMoisture(), fieldData.getTemperature());

        double claimAmount = compensationService.calculateCompensation(
                policy.getSumInsured(), "HIGH", policy.getThresholdYield());

        int fraudScore = fraudDetectionService.calculateFraudScore(
                claimAmount, wetnessIndex, policy.getThresholdYield());

        ClaimStatus status = fraudScore > 70 ? ClaimStatus.REJECTED : ClaimStatus.APPROVED;

        System.out.println("[AutoClaim] farmerId=" + farmerId + " cause=" + causeOfLoss
                + " wetnessIndex=" + wetnessIndex + " fraudScore=" + fraudScore
                + " photo=" + (photoPath != null ? "YES" : "NO"));

        Claim claim = Claim.builder()
                .insurancePolicy(policy)
                .causeOfLoss(causeOfLoss)
                .wetnessIndex(wetnessIndex)
                .diseaseDetected(null)
                .severity("HIGH")
                .fraudScore(fraudScore)
                .claimAmount(claimAmount)
                .status(status)
                .blockchainHash(null)
                .detectionSource("SENSOR")
                .photoPath(photoPath)                            // ← saves photo path in DB
                .build();

        Claim saved = claimRepository.save(claim);
        saved.setPdfPath(pdfGeneratorService.generateClaimPdf(saved));
        claimRepository.save(saved);
    }

    // ── Image-upload diagnosis ─────────────────────────────────────────────
    public Claim processImageDiagnosis(RemedyResponse remedyResponse, Long farmerId) {
        if (remedyResponse == null || remedyResponse.getConfidence() == null) {
            throw new RuntimeException("Invalid AI disease response");
        }

        List<InsurancePolicy> policies = insurancePolicyRepository.findByFarmerId(farmerId);
        if (policies.isEmpty()) {
            throw new RuntimeException("No policy found for farmerId=" + farmerId);
        }
        InsurancePolicy policy = policies.get(0);

        String severity    = remedyResponse.getConfidence() > 0.9 ? "HIGH" : "MEDIUM";
        double claimAmount = compensationService.calculateCompensation(
                policy.getSumInsured(), severity, policy.getThresholdYield());

        Claim claim = Claim.builder()
                .insurancePolicy(policy)
                .causeOfLoss(remedyResponse.getDisease())
                .wetnessIndex(0.0)
                .diseaseDetected(remedyResponse.getDisease())
                .detectedDisease(remedyResponse.getDisease())
                .recommendedRemedy(remedyResponse.getRemedy())
                .confidenceScore(remedyResponse.getConfidence())
                .severity(severity)
                .fraudScore(0)
                .claimAmount(claimAmount)
                .status(ClaimStatus.PENDING)
                .blockchainHash(null)
                .detectionSource("IMAGE")
                .photoPath(null)                                 // image upload has its own photo handling
                .build();

        Claim saved = claimRepository.save(claim);
        saved.setPdfPath(pdfGeneratorService.generateClaimPdf(saved));
        return claimRepository.save(saved);
    }
}