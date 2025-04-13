package com.darla.dto;

import lombok.Data;

@Data
public class RazorpayVerifyRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}

