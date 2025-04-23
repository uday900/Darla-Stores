package com.darla.entity;

import jakarta.persistence.Entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.*;

@Entity
@Data
@Table(name = "products")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String name;
	
	@Column(nullable = false, length = 1000)
	private String description;
	
	@Column(nullable = false)
	private Double price;
	
	@Column(nullable = false)
	private Integer stock;
	
	@Column(nullable = false)
	private Double rating;
	
	@Column(nullable = false)
	private String brand;
	
	private String colors;
	
	private String sizes;
	
	@Column(nullable = false)
	private String imageName;
	
	@Column(nullable = false)
	@Lob
	private byte[] imageData;
	
	@ManyToOne
	@JoinColumn(name = "category_id")
	@NotNull
	@JsonIgnoreProperties("products")
	private Category category;
	
	@Column(nullable = false, name = "created_at")
	private final LocalDateTime createdAt = LocalDateTime.now();
	
	
	
}
