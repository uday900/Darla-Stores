package com.darla.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {

	private Long id;

	@NotEmpty(message = "Category name is required")
	private String name;

	@NotEmpty(message = "Category description is required")
	@Size(min = 0, max = 1000, message = "Description must be between 0 and 1000 characters")
	private String description;

}
