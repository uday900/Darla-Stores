package com.darla.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CheckOutRequest {
	
	@NotNull(message = "User ID cannot be null")
	private Long userId;
	
	@NotEmpty(message = "Product ID cannot be empty")
	private String shippingAddress;
	
	@NotEmpty(message = "Product ID cannot be empty")
	private String paymentMode;
}
