package com.san.crop.insurance.repository;

import com.san.crop.insurance.model.FieldData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FieldDataRepository extends JpaRepository<FieldData, Long> {
    Optional<FieldData> findTopByOrderByTimestampDesc();
}