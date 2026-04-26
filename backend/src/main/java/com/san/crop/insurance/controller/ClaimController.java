package com.san.crop.insurance.controller;

import com.san.crop.insurance.dto.ProcessClaimRequest;
import com.san.crop.insurance.model.Claim;
import com.san.crop.insurance.repository.ClaimRepository;
import com.san.crop.insurance.service.ClaimProcessingService;
import com.san.crop.insurance.service.PdfGeneratorService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimProcessingService claimProcessingService;
    private final ClaimRepository claimRepository;
    private final PdfGeneratorService pdfGeneratorService;

    public ClaimController(ClaimProcessingService claimProcessingService,
                           ClaimRepository claimRepository,
                           PdfGeneratorService pdfGeneratorService) {
        this.claimProcessingService = claimProcessingService;
        this.claimRepository        = claimRepository;
        this.pdfGeneratorService    = pdfGeneratorService;
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Claim>> getClaimsByFarmer(@PathVariable Long farmerId) {
        List<Claim> claims = claimRepository.findByInsurancePolicy_Farmer_Id(farmerId);
        return ResponseEntity.ok(claims);
    }

    @PostMapping("/process")
    public ResponseEntity<Claim> processClaim(@RequestBody ProcessClaimRequest request) {
        Claim savedClaim = claimProcessingService.processClaim(
                request.getPolicyId(),
                request.getFieldDataId()
        );
        return new ResponseEntity<>(savedClaim, HttpStatus.CREATED);
    }

    // ── DOWNLOAD PDF — regenerated fresh every time so photo is always included ──
    @GetMapping("/{id}/pdf")
    public ResponseEntity<ByteArrayResource> downloadClaimPdf(@PathVariable Long id) {

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found: " + id));

        try {
            // Regenerate PDF fresh — this guarantees the IP Webcam photo
            // (saved in claim.photoPath) is embedded even if the PDF was
            // originally created before the photo was captured
            String freshPdfPath = pdfGeneratorService.generateClaimPdf(claim);

            claim.setPdfPath(freshPdfPath);
            claimRepository.save(claim);

            Path path = Paths.get(freshPdfPath);
            byte[] data = Files.readAllBytes(path);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=claim_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(data.length)
                    .body(new ByteArrayResource(data));

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for claim " + id, e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClaim(@PathVariable Long id) {
        if (!claimRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        claimRepository.deleteById(id);
        return ResponseEntity.ok("Claim deleted successfully");
    }
}