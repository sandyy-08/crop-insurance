package com.san.crop.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemedyResponse {

    private String disease;
    private String remedy;
    private Double confidence;

    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }

    public String getRemedy() { return remedy; }
    public void setRemedy(String remedy) { this.remedy = remedy; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}


