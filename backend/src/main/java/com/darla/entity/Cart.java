package com.darla.entity;

import jakarta.persistence.Entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.*;


@Entity
@Table(name = "cart_items")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Cart{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;
	
	@ManyToOne
	@JoinColumn(name = "product_id")
	private Product product;
	
	private Integer quantity;
	
}
