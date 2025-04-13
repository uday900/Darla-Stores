package com.darla.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
	
	private Long id;
	private Long userId;
	private String productName;
	private byte[] imageData;	
	private String brand;
	private Double price;
	
	private Integer qunaitity;

}
