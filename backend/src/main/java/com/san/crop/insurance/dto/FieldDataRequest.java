package com.san.crop.insurance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldDataRequest {

    @NotNull
    private Double temperature;

    @NotNull
    @Positive
    private Double humidity;

    @NotNull
    @Positive
    private Double soilMoisture;

    @NotNull
    @Positive
    private Double waterLevel;

    @NotNull
    private Integer rainStatus;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Long farmerId;
// + getter/setter
}

