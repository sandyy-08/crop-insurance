
package com.san.crop.insurance.service;

import org.springframework.stereotype.Service;

@Service
public class LeafWetnessService {

    public double calculateWetnessIndex(double humidity, int rainStatus, double soilMoisture, double temperature) {
        double wetnessIndex =
                (humidity * 0.4) +
                        (rainStatus * 25) +
                        (soilMoisture * 0.2) -
                        (Math.abs(temperature - 25) * 0.5);

        // Normalize between 0 and 100 (clamp)
        if (wetnessIndex < 0) {
            wetnessIndex = 0;
        } else if (wetnessIndex > 100) {
            wetnessIndex = 100;
        }

        return wetnessIndex;
    }

    public String getRiskLevel(double wetnessIndex) {
        if (wetnessIndex <= 30) {
            return "LOW";
        } else if (wetnessIndex <= 60) {
            return "MODERATE";
        } else {
            return "HIGH";
        }
    }
}