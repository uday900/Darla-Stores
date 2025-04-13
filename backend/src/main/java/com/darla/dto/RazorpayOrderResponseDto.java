package com.darla.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RazorpayOrderResponseDto {
    private String id;
    private String currency;
    private Integer amount;
}
