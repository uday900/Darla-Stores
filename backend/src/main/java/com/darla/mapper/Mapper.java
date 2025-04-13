package com.darla.mapper;

import com.darla.dto.*;
import com.darla.entity.*;
import com.darla.entity.Product;

public class Mapper {


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
