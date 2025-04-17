package com.darla.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrderRequest {
	
	private Long orderId;
	
	@NotNull(message = "User ID cannot be null")
	private Long userId;
	
	@NotNull(message = "Product ID cannot be null")
	private Long productId;
	
	@NotNull(message = "Quantity cannot be null")
	private Integer quantity;
	
	@NotEmpty(message = "Shipping address cannot be empty")
	@Size(min = 5, message = "Shipping address must be at least 5 characters long")
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
