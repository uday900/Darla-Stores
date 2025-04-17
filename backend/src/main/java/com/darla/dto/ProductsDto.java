package com.darla.dto;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
public class ProductsDto {
	
	private Long id;

	@NotEmpty(message = "Product name is required")
	@Size(min = 0, max = 255, message = "Name must be between 0 and 255 characters")
	private String name;

	@NotEmpty(message = "Product description is required")
	@Size(min = 0, max = 1000, message = "Description must be between 0 and 1000 characters")
	private String description;

	@NotNull(message = "Product price is required")
	@Min(value = 0, message = "Price must be greater than 0")
	private Double price;

	@NotNull(message = "Product stock is required")
	@Min(value = 0, message = "Stock must be greater than 0")
	private Integer stock;
	
	@Min(value = 0, message = "Rating must be greater than 0")
	@Max(value = 5, message = "Rating must be below 5")
	private Double rating;

	@NotEmpty(message = "Product brand is required")
	private String brand;

	@NotEmpty(message = "Product image name is required")
	private String colors;

	@NotEmpty(message = "Product image name is required")
	private String sizes;

	@NotNull(message = "Product image path is required")
	private String imagePath;

	@NotEmpty(message = "Category is required")
	private String category;

}
