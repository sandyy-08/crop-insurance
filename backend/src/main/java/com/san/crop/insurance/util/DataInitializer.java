package com.san.crop.insurance.util;

import com.san.crop.insurance.model.Farmer;
import com.san.crop.insurance.model.FieldData;
import com.san.crop.insurance.model.InsurancePolicy;
import com.san.crop.insurance.repository.FarmerRepository;
import com.san.crop.insurance.repository.FieldDataRepository;
import com.san.crop.insurance.repository.InsurancePolicyRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer {

    private final FarmerRepository farmerRepository;
    private final InsurancePolicyRepository insurancePolicyRepository;
    private final FieldDataRepository fieldDataRepository;

    public DataInitializer(FarmerRepository farmerRepository,
                           InsurancePolicyRepository insurancePolicyRepository,
                           FieldDataRepository fieldDataRepository) {
        this.farmerRepository = farmerRepository;
        this.insurancePolicyRepository = insurancePolicyRepository;
        this.fieldDataRepository = fieldDataRepository;
    }

    @PostConstruct
    public void initData() {
        if (farmerRepository.count() > 0) {
            return; // avoid duplicate seeding on restart
        }

        Farmer farmer = Farmer.builder()
                .name("San Farmer")
                .aadhaarMasked("XXXX-XXXX-1234")
                .district("Chennai")
                .village("Village A")
                .build();
        farmer = farmerRepository.save(farmer);

        InsurancePolicy policy = InsurancePolicy.builder()
                .policyNumber("POL001")
                .cropType("Rice")
                .sumInsured(50000)
                .thresholdYield(3000)
                .areaInsured(2.5)
                .farmer(farmer)
                .build();
        policy = insurancePolicyRepository.save(policy);

        FieldData fieldData = FieldData.builder()
                .temperature(38)
                .humidity(90)
                .soilMoisture(75)
                .rainStatus(1)
                .waterLevel(80)
                .latitude(13.0827)
                .longitude(80.2707)
                .timestamp(LocalDateTime.now())
                .build();
        fieldDataRepository.save(fieldData);
    }
}