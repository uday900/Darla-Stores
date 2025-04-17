package com.darla.service;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.darla.dto.CategoryDto;
import com.darla.dto.Response;
import com.darla.entity.Category;
import com.darla.repository.CategoryRepository;
import com.darla.repository.ProductRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Validator;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepo;
	private final ProductRepository productRepository;
	private final Validator validator;

	public CategoryService(CategoryRepository categoryRepo, ProductRepository productRepository, Validator validator) {
		this.categoryRepo = categoryRepo;
		this.productRepository = productRepository;
		this.validator = validator;
	}

	// Add a new category
//	 returns a string and accepts category dto
	public String addCategory(CategoryDto categoryDto) {
		// map to category entity
		Category category = Category.builder().name(categoryDto.getName()).description(categoryDto.getDescription())
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
		List<Category> categories = categoryDtos.stream().map(categoryDto -> Category.builder()
				.name(categoryDto.getName()).description(categoryDto.getDescription()).build()).toList();

		// save to database
		categoryRepo.saveAll(categories);

		// add entry to activity logs
		ActivityLogs.addEntry("Multiple categories added");

		return "Categories added successfully";
	}

	// Get all categories
	// returns a list of category dto
	public List<CategoryDto> fetchCategories() {
		// get all categories from the database
		List<Category> categories = categoryRepo.findAll();

		// map to category dto
		List<CategoryDto> categoryDtos = categories.stream().map(category -> CategoryDto.builder().id(category.getId())
				.name(category.getName()).description(category.getDescription()).build()).toList();

		return categoryDtos;
	}

	// fetch a category by id
	// returns a category dto and accepts an id
	public CategoryDto fetchCategoryById(Long id) {
		// get category from the database
		Category category = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

		// map to category dto
		CategoryDto categoryDto = CategoryDto.builder().id(category.getId()).name(category.getName())
				.description(category.getDescription()).build();

		return categoryDto;
	}

	// update a category by id
	// returns a string and accepts an id and category dto
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
	// returns a string and accepts an id
	@Transactional
	public String deleteCategory(Long id) {
		// get category from the database
		Category category = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

		// checking if there are any products in the category, then delete them

		if (category.getProducts().size() > 0) {
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

	public Response uploadCategories(MultipartFile file) {

		Response response = new Response();
		List<CategoryDto> validCategories = new ArrayList<>();
		Map<String, Object> errors = new HashMap<>();

		if (file.isEmpty() || file.getOriginalFilename().contains(".csv") == false) {
			response.setStatus(400);
			response.setMessage("Uploaded File is empty or not a CSV file");
			return response;
		}

		// parse the csv file
		try (var reader = new InputStreamReader(file.getInputStream());
				var csvReader = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {

			int row = 1;
			for (CSVRecord record : csvReader) {
				row++;
				CategoryDto categoryDto = CategoryDto.builder()
						.name(record.get("name").trim())
						.description(record.get("description").trim())
						.build();
				
				System.out.println("Category DTO: " + categoryDto.toString());
				// validate the category dto
				var violations = validator.validate(categoryDto);
				if (!violations.isEmpty()) {
					for (var v : violations) {
//						errors.add(Map.of("row", row, "error", v.getMessage()));
						errors.put("For the record "+ row, v.getMessage());
					}
					continue;
				}
				Optional<Category> category = categoryRepo.findByName(categoryDto.getName());
				if (category.isPresent()) {
//					errors.add(Map.of("row", row, "error", "Category already exists"));
					errors.put("For the record "+ row, "Category already exists " + categoryDto.getName());	
					continue;
				}
//				System.out.println("Valid category: " + categoryDto.toString());
				validCategories.add(categoryDto);
			}

			// save the valid categories to the database
//			System.out.println("Valid categories: " + validCategories);
			if (errors.isEmpty()) {
				List<Category> categories = validCategories.stream().map(categoryDto -> Category.builder()
						.name(categoryDto.getName()).description(categoryDto.getDescription()).build()).toList();

				categoryRepo.saveAll(categories);
			} else {
				response.setStatus(400);
				response.setMessage("Validation failed. Please check the values");
				response.setErrors(errors);
				return response;
			}

		} catch (Exception e) {
			response.setStatus(400);
			response.setMessage("Error parsing CSV file " + e.getMessage());
			return response;
		}

		response.setStatus(200);
		response.setMessage("Categories uploaded and added successfully");
		
		// add entry to activity logs
		ActivityLogs.addEntry("Multiple categories added");

		return response;

	}

}
