package com.darla.dto;


import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class ReviewDto {

	private Long id;
	
	@NotNull(message = "product id can't be null")
    private Long productId;

	@NotNull(message = "user id can't be null")
    private Long userId;
    
    private String userName;

    @NotNull(message = "rating can't be null")
    @Min(value = 0, message = "rating >= 0")
    @Max(value = 5, message = "rating <= 5")
    private Double rating;
    
    @NotEmpty(message = "comment can't be empty")
    private String comment;
    
    private LocalDateTime createdAt;
}

