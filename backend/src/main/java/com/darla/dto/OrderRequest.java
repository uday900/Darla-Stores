package com.darla.dto;

import lombok.Data;

@Data
public class OrderRequest {
	
	private Long orderId;
	
	
	private Long userId;
	private Long productId;
	private Integer quantity;
	
	private String shippingAddress;
	
	
	
	private String razorpayPaymentId;
	private String razorpaySignature;
	private String razorpayOrderId;
	private String orderAmount;
	private String orderCurrency;
	private String orderStatus;
	private String paymentMode;
	private String paymentStatus;
	private String paymentDate;
	private String orderDate;
	private String orderDescription;
	private String orderReceipt;

	// Add any other fields you need for the order request	
}
