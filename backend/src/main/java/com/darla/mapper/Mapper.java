package com.darla.mapper;

import com.darla.dto.*;
import com.darla.entity.*;
import com.darla.entity.Product;

public class Mapper {


	public static UserDto mapToUserDto(User user) {
		return UserDto.builder()
				.id(user.getId())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRole())
				.phoneNumber(user.getPhoneNumber())
				.street(user.getStreet())
				.city(user.getCity())
				.district(user.getDistrict())
				.zipCode(user.getZipCode())
				.state(user.getState())
				.country(user.getCountry())
				.createdAt(user.getCreatedAt())
				
				.build();
	}
	public static ProductDto mapToProductDto(Product product) {
		return ProductDto.builder()
				.id(product.getId())
				.name(product.getName())
				.description(product.getDescription())
				.price(product.getPrice())
				.stock(product.getStock())
				.rating(product.getRating())
				.brand(product.getBrand())
				.colors(product.getColors())
				.sizes(product.getSizes())
				.imageName(product.getImageName())
				.imageData(product.getImageData())
				.category(product.getCategory().getName())
				.build();
	}
}
