package com.san.crop.insurance.service;

import org.springframework.stereotype.Service;

@Service
public class DiseaseDetectionService {

    public DiseaseResult detectDisease(double temperature, double humidity, double soilMoisture) {
        String disease;
        String severity;

        if (humidity > 80 && temperature >= 25 && temperature <= 35) {
            disease = "Fungal Infection";
            severity = "HIGH";
        } else if (soilMoisture < 30) {
            disease = "Drought Stress";
            severity = "MEDIUM";
        } else {
            disease = "Healthy";
            severity = "LOW";
        }

        return new DiseaseResult(disease, severity);
    }

    public static class DiseaseResult {
        private final String diseaseName;
        private final String severity;

        public DiseaseResult(String diseaseName, String severity) {
            this.diseaseName = diseaseName;
            this.severity = severity;
        }

        public String getDiseaseName() {
            return diseaseName;
        }

        public String getSeverity() {
            return severity;
        }
    }
}

