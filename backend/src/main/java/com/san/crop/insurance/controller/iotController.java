package com.san.crop.insurance.controller;

import com.san.crop.insurance.dto.FieldDataRequest;
import com.san.crop.insurance.dto.RemedyResponse;
import com.san.crop.insurance.model.FieldData;
import com.san.crop.insurance.service.ClaimProcessingService;
import com.san.crop.insurance.service.FieldDataService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/iot")
@CrossOrigin(origins = "*")
public class iotController {

    private final FieldDataService fieldDataService;
    private final ClaimProcessingService claimProcessingService;
    private final RestTemplate restTemplate;

    @Value("${ai.image.server.url:http://localhost:5000/predict}")
    private String aiImageServerUrl;

    public iotController(FieldDataService fieldDataService,
                         ClaimProcessingService claimProcessingService,
                         RestTemplate restTemplate) {
        this.fieldDataService = fieldDataService;
        this.claimProcessingService = claimProcessingService;
        this.restTemplate = restTemplate;
    }

    /**
     * Accepts sensor payload from ESP32.
     * If request includes farmerId, passes it through so the claim is correctly
     * linked to that farmer AND the IP Webcam photo is captured automatically.
     *
     * FieldDataRequest must have a farmerId field (Long).
     * If farmerId is missing, falls back to no-farmer path (no claim created).
     */
    @PostMapping("/sensor")
    public ResponseEntity<FieldData> ingestSensorData(@RequestBody FieldDataRequest request) {
        FieldData saved = fieldDataService.saveFieldData(request);

        // ── Pass farmerId so IP Webcam photo is captured on abnormal readings ──
        Long farmerId = request.getFarmerId();   // add getFarmerId() to FieldDataRequest if missing
        if (farmerId != null) {
            claimProcessingService.autoEvaluateAndProcess(saved, farmerId);
        } else {
            claimProcessingService.autoEvaluateAndProcess(saved);  // backward-compatible fallback
        }

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Accepts crop image, forwards to AI server, triggers image-based claim if confidence > 80%.
     * Photo is the user-uploaded image — no IP Webcam needed here.
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RemedyResponse> uploadImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("farmerId") Long farmerId) {
        try {
            ByteArrayResource imageResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", imageResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<RemedyResponse> response = restTemplate
                    .postForEntity(aiImageServerUrl, requestEntity, RemedyResponse.class);

            RemedyResponse remedy = response.getBody();
            if (remedy != null && remedy.getConfidence() != null && remedy.getConfidence() > 0.80) {
                claimProcessingService.processImageDiagnosis(remedy, farmerId);
            }

            return ResponseEntity.ok(remedy);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to process image upload", e);
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<FieldData> getLatestSensorData() {
        FieldData latest = fieldDataService.getLatestFieldData();
        return ResponseEntity.ok(latest);
    }
}