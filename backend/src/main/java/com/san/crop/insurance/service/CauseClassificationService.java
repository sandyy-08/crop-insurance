
package com.san.crop.insurance.service;

import org.springframework.stereotype.Service;

@Service
public class CauseClassificationService {

    public String classifyCause(double temperature,
                                double soilMoisture,
                                int rainStatus,
                                double waterLevel,
                                double wetnessIndex) {

        // Flood
        if (rainStatus == 1 && soilMoisture > 70 && waterLevel > 70) {
            return "Flood";
        }

        // Drought
        if (soilMoisture < 30 && temperature > 35 && rainStatus == 0) {
            return "Drought";
        }

        // Fungal Outbreak
        if (wetnessIndex > 60) {
            return "Fungal Outbreak";
        }

        // Otherwise
        return "Suspicious";
    }

    public int calculateFraudScore(String cause) {
        return switch (cause) {
            case "Flood" -> 10;
            case "Drought" -> 15;
            case "Fungal Outbreak" -> 20;
            case "Suspicious" -> 70;
            default -> 70;
        };
    }
}