package com.darla.dto;

import lombok.Builder;

import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.razorpay.Order;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {
	
	private RazorpayOrderResponseDto razorpayOrder;
	private Map<String, Object> metrics;
	
	private String message;
	
	private Integer status;
	
	private List<ProductDto> products;
	
	private ProductDto product;
	
	private CategoryDto category;
	
	private List<CategoryDto> categories;
	
	private String token;
	
	private UserDto user;
	

}
