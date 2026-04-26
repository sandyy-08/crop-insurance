package com.san.crop.insurance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String aadhaarMasked;

    private String district;

    private String village;
    @Column(unique = true)
    private String email;

    private String password;


    @Column(name = "farmer_id")
    private String farmerId;

    // Farm land GPS coordinates
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // Optional location details (auto-filled from reverse geocode)


}