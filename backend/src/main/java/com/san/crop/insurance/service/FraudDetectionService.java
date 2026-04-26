package com.san.crop.insurance.service;

import org.springframework.stereotype.Service;

@Service
public class FraudDetectionService {

    public int calculateFraudScore(double claimAmount, double wetnessIndex, double historicalAverage) {
        if (historicalAverage <= 0) {
            historicalAverage = claimAmount > 0 ? claimAmount : 1.0;
        }

        double claimRatio = claimAmount / historicalAverage;
        if (claimRatio < 0) {
            claimRatio = 0;
        }

        double wetnessFactor = 1.0 - (Math.max(0.0, Math.min(wetnessIndex, 100.0)) / 100.0);

        double score = (claimRatio * 50.0) + (wetnessFactor * 50.0);
        if (score > 100.0) {
            score = 100.0;
        }
        if (score < 0.0) {
            score = 0.0;
        }

        return (int) Math.round(score);
    }
}

