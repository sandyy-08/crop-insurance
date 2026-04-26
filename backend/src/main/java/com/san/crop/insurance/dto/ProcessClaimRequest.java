
package com.san.crop.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessClaimRequest {

    private Long policyId;
    private Long fieldDataId;
}