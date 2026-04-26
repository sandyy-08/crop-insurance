package com.san.crop.insurance.service;

import org.springframework.stereotype.Service;

@Service
public class CompensationService {

    public double calculateClaim(double thresholdYield, double actualYield, double sumInsured) {
        if (thresholdYield <= 0) {
            return 0.0;
        }

        double lossRatio = (thresholdYield - actualYield) / thresholdYield;
        double claimAmount = lossRatio * sumInsured;

        if (claimAmount < 0) {
            return 0.0;
        }
        return claimAmount;
    }

    public double calculateCompensation(double sumInsured, String severity, double thresholdYield) {
        double multiplier;
        if ("HIGH".equalsIgnoreCase(severity)) {
            multiplier = 0.8;
        } else if ("MEDIUM".equalsIgnoreCase(severity)) {
            multiplier = 0.5;
        } else {
            multiplier = 0.2;
        }
        return sumInsured * multiplier;
    }
}
