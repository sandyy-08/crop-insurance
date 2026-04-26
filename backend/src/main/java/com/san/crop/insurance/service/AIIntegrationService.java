package com.san.crop.insurance.service;

import com.san.crop.insurance.dto.AIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AIIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${ai.server.url:http://localhost:5000/predict}")
    private String aiServerUrl;

    public AIIntegrationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AIResponse analyzeImage(MultipartFile image) {
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

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AIResponse> response = restTemplate.exchange(
                    aiServerUrl,
                    HttpMethod.POST,
                    requestEntity,
                    AIResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI server", e);
        }
    }
}