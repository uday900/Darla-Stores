package com.darla.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	
	@Column(unique = true)
	private String email;
	
	private String password;
	
	private String role;
	
	private String city;
	private String state;
	private String country;
	private String district;
	private String street;
	private String zipCode;
	
	private String phoneNumber;
	
	@Column(name = "created_at")
	private LocalDateTime createdAt = LocalDateTime.now();

}
