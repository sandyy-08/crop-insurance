package com.san.crop.insurance.service;

import org.springframework.stereotype.Service;

@Service
public class NaturalCauseService {

    public String classifyCause(double rainStatus, double waterLevel, double soilMoisture, double humidity) {
        if (waterLevel > 80) {
            return "FLOOD";
        }
        if (soilMoisture < 20) {
            return "DROUGHT";
        }
        if (rainStatus == 1 && humidity > 85) {
            return "EXCESS_RAIN";
        }
        return "NORMAL";
    }
}

