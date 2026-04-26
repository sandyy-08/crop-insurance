
package com.san.crop.insurance.controller;

import com.san.crop.insurance.service.CauseClassificationService;
import com.san.crop.insurance.service.CompensationService;
import com.san.crop.insurance.service.LeafWetnessService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {

    private final LeafWetnessService leafWetnessService;
    private final CauseClassificationService causeClassificationService;
    private final CompensationService compensationService;

    public TestController(LeafWetnessService leafWetnessService,
                          CauseClassificationService causeClassificationService,
                          CompensationService compensationService) {
        this.leafWetnessService = leafWetnessService;
        this.causeClassificationService = causeClassificationService;
        this.compensationService = compensationService;
    }

    @GetMapping("/api/test-logic")
    public Map<String, Object> testLogic() {
        // Hardcoded sample values
        double temperature = 38;
        double humidity = 90;
        double soilMoisture = 75;
        int rainStatus = 1;
        double waterLevel = 80;
        double thresholdYield = 3000;
        double actualYield = 2000;
        double sumInsured = 50000;

        double wetnessIndex = leafWetnessService.calculateWetnessIndex(
                humidity, rainStatus, soilMoisture, temperature
        );
        String riskLevel = leafWetnessService.getRiskLevel(wetnessIndex);

        String cause = causeClassificationService.classifyCause(
                temperature, soilMoisture, rainStatus, waterLevel, wetnessIndex
        );
        int fraudScore = causeClassificationService.calculateFraudScore(cause);

        double claimAmount = compensationService.calculateClaim(
                thresholdYield, actualYield, sumInsured
        );

        Map<String, Object> response = new HashMap<>();
        response.put("wetnessIndex", wetnessIndex);
        response.put("riskLevel", riskLevel);
        response.put("cause", cause);
        response.put("fraudScore", fraudScore);
        response.put("claimAmount", claimAmount);

        return response;
    }
}