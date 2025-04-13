package com.darla.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.darla.dto.CategoryDto;
import com.darla.entity.Category;
import com.darla.repository.CategoryRepository;
import com.darla.repository.ProductRepository;

import jakarta.transaction.Transactional;

@Service
public class CategoryService {
	
	private final CategoryRepository categoryRepo;
	private final ProductRepository productRepository;
	
	public CategoryService(CategoryRepository categoryRepo,
			ProductRepository productRepository) {
		this.categoryRepo = categoryRepo;
		this.productRepository = productRepository;	
	}
	
	
	// Add a new category
//	 returns a string and accepts category dto
	public String addCategory(CategoryDto categoryDto) {
		// map to category entity
		Category category = Category.builder()
				.name(categoryDto.getName())
				.description(categoryDto.getDescription())
				.build();
		
		// save to database
		categoryRepo.save(category);
		
		// add entry to activity logs
		ActivityLogs.addEntry("new category added: " + categoryDto.getName());
		
		return "Category added successfully";
	}
	
	// add several categories [for testing purpose only]
	// returns a string and accepts a list of category dto
	public String addCategories(List<CategoryDto> categoryDtos) {
		// map to category entity
		List<Category> categories = categoryDtos.stream()
				.map(categoryDto -> Category.builder()
				.name(categoryDto.getName())
				.description(categoryDto.getDescription())
				.build()).toList();

		// save to database
		categoryRepo.saveAll(categories);
		
		// add entry to activity logs
		ActivityLogs.addEntry("Multiple categories added");

		return "Categories added successfully";
	}

	// Get all categories
	//	returns a list of category dto
	public List<CategoryDto> fetchCategories() {
		// get all categories from the database
		List<Category> categories = categoryRepo.findAll();
		
		// map to category dto
		List<CategoryDto> categoryDtos = categories.stream()
				.map(category -> CategoryDto.builder()
						.id(category.getId())
						.name(category.getName())
						.description(category.getDescription())
						.build()).toList();
		
		return categoryDtos;
	}
	
	// fetch a category by id
	//	returns a category dto and accepts an id	
	public CategoryDto fetchCategoryById(Long id) {
		// get category from the database
		Category category = categoryRepo.findById(id).orElseThrow(
				() -> new RuntimeException("Category not found"));

		// map to category dto
		CategoryDto categoryDto = CategoryDto.builder()
				.id(category.getId())
				.name(category.getName())
				.description(category.getDescription())
				.build();

		return categoryDto;
	}
	
	// update a category by id
	//	returns a string and accepts an id and category dto
	public String updateCategory(Long id, CategoryDto categoryDto) {
		// get category from the database
		Category category = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

		// update category
		category.setName(categoryDto.getName());
		category.setDescription(categoryDto.getDescription());

		// save to database
		categoryRepo.save(category);
		
		// add entry to activity logs
		ActivityLogs.addEntry("category updated: " + categoryDto.getName());

		return "Category updated successfully";
	}
	
	// delete a category by id
	//	returns a string and accepts an id
	@Transactional
	public String deleteCategory(Long id) {
		// get category from the database
		Category category = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

		// checking if there are any products in the category, then delete them
		
		if ( category.getProducts().size() > 0 ) {
			category.getProducts().forEach(product -> {
				productRepository.delete(product);
			});
		}
		// delete from the database
		categoryRepo.delete(category);
		// add entry to activity logs
		ActivityLogs.addEntry("category deleted: " + category.getName());

		return "Category deleted successfully";
	}

}
