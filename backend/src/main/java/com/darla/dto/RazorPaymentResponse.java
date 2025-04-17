package com.darla.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RazorPaymentResponse {
	
	@NotEmpty(message = "Razorpay payment ID is required")
    private String razorpay_payment_id;
	
	@NotEmpty(message = "Razorpay order ID is required")
    private String razorpay_order_id;
	    
	@NotEmpty(message = "Razorpay signature is required")
    private String razorpay_signature;
}