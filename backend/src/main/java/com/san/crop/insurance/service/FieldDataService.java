package com.san.crop.insurance.service;

import com.san.crop.insurance.dto.FieldDataRequest;
import com.san.crop.insurance.model.FieldData;
import com.san.crop.insurance.repository.FieldDataRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FieldDataService {

    private final FieldDataRepository fieldDataRepository;

    public FieldDataService(FieldDataRepository fieldDataRepository) {
        this.fieldDataRepository = fieldDataRepository;
    }

    public FieldData saveFieldData(FieldDataRequest request) {
        FieldData fieldData = FieldData.builder()
                .temperature(request.getTemperature())
                .humidity(request.getHumidity())
                .soilMoisture(request.getSoilMoisture())
                .waterLevel(request.getWaterLevel())
                .rainStatus(request.getRainStatus())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        return fieldDataRepository.save(fieldData);
    }

    public List<FieldData> getAllFieldData() {
        return fieldDataRepository.findAll();
    }

    public FieldData getLatestFieldData() {
        return fieldDataRepository.findTopByOrderByTimestampDesc()
                .orElseThrow(() -> new RuntimeException("No field data available"));
    }
}

