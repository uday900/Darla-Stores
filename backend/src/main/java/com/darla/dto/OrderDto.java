package com.darla.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class OrderDto {

	    private Long id;
	    
	    @NotNull(message = "user id can't be null")
	    private Long userId;
	    
	    @NotNull(message = "product id can't be null")
	    private Long productId;
	    
	    @NotEmpty(message = "product Name can't be empty")
	    private String productName;
	    
	    // IMAGE DATA
	    private byte[] imageData;	
	    
	    @NotNull(message = "quantity should be greater than 0")
	    private Integer quantity;
	    
	    private Double totalAmount;
	    
	    private LocalDateTime createdAt;

	    @NotEmpty(message = "status is required")
	    private String status; // PENDING, SHIPPED, DELIVERED, CANCELED
	    
	    private String paymentId;
	    
	    private String paymentMethod; // CASH_ON_DELIVERY, RAZORPAY
	    
	    private String paymentStatus; // PENDING, COMPLETED, FAILED
	    
	    private String shippingAddress;
	    
	    
}
