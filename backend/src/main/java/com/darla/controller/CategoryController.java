package com.darla.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.darla.dto.CategoryDto;
import com.darla.dto.Response;
import com.darla.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/category")
@Validated
public class CategoryController {
	
	private final CategoryService categoryService;
	
	public CategoryController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}
	
	
	// Add a new category, return a response entity and accept a category dto	
	@PostMapping
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> addCategory(@Valid @RequestBody CategoryDto categoryDto) {
		// call the service to add the category
		String message = categoryService.addCategory(categoryDto);
		Response response = Response.builder().message(message).build();

		return ResponseEntity.ok(response);
	}
	
	// Add several categories [for testing purpose only]
	// return a response entity and accept a list of category dto
//	@PostMapping("/add-categories")
//	@PreAuthorize("hasRole('ROLE_ADMIN')")
//	public ResponseEntity<Response> addCategories(@RequestBody List<@Valid CategoryDto> categoryDtos) {
//		// call the service to add the categories
//		String message = categoryService.addCategories(categoryDtos);
//		
//		Response response = Response.builder().message(message).build();
//
//		return ResponseEntity.ok(response);
//	}
	
	/*
	 * upload multiple categories through csv file
	 * have a csv file
	 * with name, description
	 */
	@PostMapping("/upload-csv")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> uploadCategories(
			@RequestParam("file") MultipartFile file) {
		// call the service to upload the categories
		Response response = categoryService.uploadCategories(file);

		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	// Get all categories
	// return a response entity and accept no parameter
	@GetMapping
	public ResponseEntity<Response> fetchCategories() {
		// call the service to fetch all categories
		List<CategoryDto> categoryDtos = categoryService.fetchCategories();
		Response response = new Response();
		response.setCategories(categoryDtos);

		return ResponseEntity.ok(response);
	}
	
	// Get a category by id
	// return a response entity and accept an id
	@GetMapping("/{id}")
	public ResponseEntity<Response> fetchCategory(@PathVariable Long id) {
		// call the service to fetch the category
		CategoryDto categoryDto = categoryService.fetchCategoryById(id);

		Response response = new Response();
		response.setCategory(categoryDto);
		// return the response entity
		return ResponseEntity.ok(response);
	}
	
	// Update a category
	// return a response entity and accept an id and a category dto
	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto categoryDto) {
		// call the service to update the category
		String message = categoryService.updateCategory(id, categoryDto);
		Response response = Response.builder().message(message).build();
		return ResponseEntity.ok(response);
	}
	
	// Delete a category
	// return a response entity and accept an id
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> deleteCategory(@PathVariable Long id) {
		// call the service to delete the category
		String message = categoryService.deleteCategory(id);
		Response response = Response.builder().message(message).build();

		return ResponseEntity.ok(response);
	}
	
	
	

}
