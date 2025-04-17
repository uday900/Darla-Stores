package com.darla.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RazorpayVerifyRequest {
	@NotEmpty(message = "Razorpay order ID is required")
    private String razorpayOrderId;
	
	@NotEmpty(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;
	
	@NotEmpty(message = "Razorpay signature is required")
    private String razorpaySignature;
}

