package com.san.crop.insurance.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "field_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double temperature;

    private double humidity;

    private double soilMoisture;

    private int rainStatus;

    private double waterLevel;

    private double latitude;

    private double longitude;

    private LocalDateTime timestamp;
}