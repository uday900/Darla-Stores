package com.darla.dto;

import lombok.Data;

@Data
public class RazorPaymentResponse {
	    private String razorpay_payment_id;
	    private String razorpay_order_id;
	    private String razorpay_signature;
}