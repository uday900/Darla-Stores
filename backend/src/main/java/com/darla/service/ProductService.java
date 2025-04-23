package com.darla.service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.darla.dto.OrderDto;
import com.darla.dto.ProductDto;
import com.darla.dto.ProductsDto;
import com.darla.dto.Response;
import com.darla.entity.Category;
import com.darla.entity.Order;
import com.darla.entity.Product;
import com.darla.exception_handling.NotFoundException;
import com.darla.mapper.Mapper;
import com.darla.repository.*;
import com.darla.entity.Carousel;
import com.darla.repository.CarouselRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Validator;

@Service
public class ProductService {

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;
	private final Validator validator;
	@Autowired
	private CarouselRepository carouselRepository;

	@Autowired
	private UserRepository userRepository;
	@Autowired
	private OrderRepository orderRepository;

	public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
			Validator validator) {
		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
		this.validator = validator;
	}

	// fetch all products, only for admin
	@Transactional
	public List<ProductDto> fetchAllProducts() {
		List<Product> products = productRepository.findAll();
		// send newest products first
		products.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
		
		return products.stream().map(Mapper::mapToProductDto).collect(Collectors.toList());
	}

	// fetch product by id
	@Transactional
	public ProductDto fetchProductById(Long id) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Product with id " + id + " not found"));
		return Mapper.mapToProductDto(product);
	}

	// add product, only for admin
	@Transactional
	public String addProduct(ProductDto productDto) throws IOException {
		// check if category exists
		Optional<Category> category = categoryRepository.findByName(productDto.getCategory());

		if (category.isEmpty()) {
			throw new NotFoundException("Category with name " + productDto.getCategory() + " not found");

		}

		Product product = Product.builder().name(productDto.getName()).price(productDto.getPrice())
				.description(productDto.getDescription()).stock(productDto.getStock()).rating(0.0) // set 1 for default
				.brand(productDto.getBrand()).colors(productDto.getColors()).sizes(productDto.getSizes())

				.imageName(productDto.getImageFile().getOriginalFilename())
				.imageData(productDto.getImageFile().getBytes())

				.category(category.get())

				.build();
		productRepository.save(product);

		// add to activity logs
		ActivityLogs.addEntry("Product " + product.getName() + " added successfully");
		return "Product added successfully";
	}

	// delete product, only for admin
	public String deleteProduct(Long id) {
		// check if product exists
		productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product with id " + id + " not found"));

		productRepository.deleteById(id);
		// add to activity logs
		ActivityLogs.addEntry("Product with id " + id + " deleted successfully");
		return "Product deleted successfully";
	}

	// fetch products by category
	@Transactional
	public List<ProductDto> fetchProductsByCategory(String category) {
		if (category == null || category.isEmpty()) {
			throw new NotFoundException("Category name cannot be null");
		}

		Optional<Category> categoryObj = categoryRepository.findByName(category);
		if (categoryObj.isEmpty()) {
			throw new NotFoundException("Category with name " + category + " not found");
		}

		List<Product> products = productRepository.findByCategoryName(categoryObj.get().getName());

		return products.stream().map(Mapper::mapToProductDto).collect(Collectors.toList());
	}

	// fetch products by search query
	@Transactional
	public List<ProductDto> fetchProductsBySearch(String query) {
		if (query == null || query.isEmpty()) {
			throw new NotFoundException("Search query cannot be null");
		}
		List<Product> products = productRepository.findBySearchQuery(query);

		return products.stream().map(Mapper::mapToProductDto).collect(Collectors.toList());
	}

	@Transactional
	public String addMultipleProducts(List<ProductsDto> productsDto) throws IOException {

		for (ProductsDto productDto : productsDto) {
			Optional<Category> category = categoryRepository.findByName(productDto.getCategory());

			if (category.isEmpty()) {
				throw new NotFoundException("Category with name " + productDto.getCategory() + " not found");
			}

			Product product = Product.builder().name(productDto.getName()).description(productDto.getDescription())
					.price(productDto.getPrice()).brand(productDto.getBrand()).stock(productDto.getStock()).rating(0.0)// 1
																														// for
																														// default
																														// one
					.colors(productDto.getColors()).sizes(productDto.getSizes())
					// set category, imagename, data

					.imageData(Files.readAllBytes(Paths.get(productDto.getImagePath())))
					.imageName(Paths.get(productDto.getImagePath()).getFileName().toString()).category(category.get())
					.build();

			productRepository.save(product);
		}
		// add to activity logs
		ActivityLogs.addEntry("Multiple Products added");

		return "Products added successfully!";
	}

	@Transactional
	public String updateProduct(Long id, String name, String description, Double price, Integer stock, String brand,
			String colors, String sizes, String category, MultipartFile imageFile) {

		Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));

		// Update only if the new values are not null or empty
		if (name != null && !name.trim().isEmpty()) {
			product.setName(name);
		}
		if (description != null && !description.trim().isEmpty()) {
			product.setDescription(description);
		}
		if (price != null) {
			product.setPrice(price);
		}
		if (stock != null) {
			product.setStock(stock);
		}
		if (brand != null && !brand.trim().isEmpty()) {
			product.setBrand(brand);
		}
		if (colors != null && !colors.trim().isEmpty()) {
			product.setColors(colors);
		}
		if (sizes != null && !sizes.trim().isEmpty()) {
			product.setSizes(sizes);
		}
		if (category != null && !category.trim().isEmpty()) {
			Category categoryObj = categoryRepository.findByName(category)
					.orElseThrow(() -> new NotFoundException("Category not found"));
			product.setCategory(categoryObj);
		}
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				byte[] imageBytes = imageFile.getBytes();
				product.setImageData(imageBytes);
				product.setImageName(imageFile.getOriginalFilename());

			} catch (IOException e) {
				throw new RuntimeException("Failed to process image file", e);
			}
		}

		productRepository.save(product);

		// add to activity logs
		ActivityLogs.addEntry("Product with id " + id + " updated successfully");
		return "Product updated successfully!";
	}

	// carousel-images functionalities
	// fetch all carousel images
	@Transactional
	public List<Carousel> fetchAllCarouselImages() {
		List<Carousel> list = carouselRepository.findAll();

		return list;
	}

	// fetch carousel image by id
	@Transactional
	public String addNewCarouselImage(MultipartFile image) throws IOException {

		Carousel newImage = new Carousel();
		newImage.setImageName(image.getOriginalFilename());
		newImage.setImageData(image.getBytes());

		carouselRepository.save(newImage);
		// add to activity logs
		ActivityLogs.addEntry("New carousel image added successfully");
		return "Successfully added..";

	}

	public String removeCarouselImage(Long id) {
		Carousel existing = carouselRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Image not found with id " + id));

		carouselRepository.deleteById(id);
		// add to activity logs
		ActivityLogs.addEntry("Image with id " + id + " deleted successfully");
		return "Successfully deleted the image " + existing.getImageName();
	}

	@Transactional
	public Map<String, Object> fetchMetrics() {
		/*
		 * send the metrics of the products total number of products users orders
		 * categories carousels recent orders
		 */

		int totalProducts = productRepository.countProducts();
		int totalUsers = userRepository.countUsers() -1 ; // excluding admin;
		int totalOrders = orderRepository.countOrders();
		int totalCategories = categoryRepository.countCategories();
		int totalCarousels = carouselRepository.countCarousels();

		List<OrderDto> recentOrders = orderRepository.findRecentOrders(LocalDateTime.now().minusDays(7)).stream()
				.map((order) -> OrderDto.builder().id(order.getId()).userId(order.getUser().getId())
						.productName(order.getProduct().getName()).productId(order.getProduct().getId())
						.quantity(order.getQuantity()).totalAmount(order.getTotalAmount())
						.createdAt(order.getCreatedAt()).status(order.getStatus())

						.build())
				.collect(Collectors.toList());

		Map<String, Object> metrics = new HashMap<>();
		metrics.put("totalProducts", totalProducts);
		metrics.put("totalUsers", totalUsers);
		metrics.put("totalOrders", totalOrders);
		metrics.put("totalCategories", totalCategories);
		metrics.put("totalCarousels", totalCarousels);
		metrics.put("recentOrders", recentOrders);

		// add to activity logs
		metrics.put("activities", ActivityLogs.deque);

//		Map<String, Object> recentActivites = new HashMap<>();

//		recentActivites.put("New user registered", recentOrders);

		return metrics;
	}

	@Transactional
	public Map<String, List<ProductDto>> fetchShowcaseProducts() {
		/*
		 * sending the showcase products with top 3 categories and top 10 products
		 * topTenProducts
		 */
		Map<String, List<ProductDto>> showcaseProducts = new HashMap<>();
		
		List<ProductDto> topTenProducts = productRepository.findTopTenProducts().stream().map(Mapper::mapToProductDto)
				.collect(Collectors.toList());
		
		// fetch top 5 categories
		Pageable pageable = PageRequest.of(0, 5);
//		List<Category> categories = categoryRepository.findTopFiveCategories(pageable);
		List<Category> categories = categoryRepository.findCategoriesWithMoreThanFiveProductsNative();
		System.out.println("categories: " );

		
		showcaseProducts.put("topTenProducts", topTenProducts);
		for (Category category : categories) {
//			List<ProductDto> products = productRepository.findByCategoryName(category.getName()).stream()
//					.map(Mapper::mapToProductDto).collect(Collectors.toList());
			showcaseProducts.put(
					category.getName(),
					productRepository.getFiveProductsByCategory(category.getName())
						.stream()
						.map(Mapper::mapToProductDto)
						.collect(Collectors.toList()));
		}
		return showcaseProducts;

	}

	public Response uploadProducts(MultipartFile file) {
		
		List<ProductsDto> validProducts = new ArrayList<>();
		Map<String, Object> errors = new HashMap<>();	
		
		
		if (file.isEmpty() || file.getOriginalFilename().contains(".csv") == false) {
			Response response = new Response();
			response.setStatus(400);
			response.setMessage("Uploaded File is empty or not a CSV file");
			return response;
		}

		
		try( var reader = new InputStreamReader(file.getInputStream());
				 var csvParser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)
				
				) {
            int row = 1;
   
            for (CSVRecord record : csvParser) {
            	row++;
            	ProductsDto dto = ProductsDto.builder()
                        .name(record.get("name"))
                        .description(record.get("description"))
                        .price(Double.parseDouble(record.get("price")))
                        .brand(record.get("brand"))
                        .stock(Integer.parseInt(record.get("stock")))
//                        .rating(Double.parseDouble(record.get("rating")))
                        .colors(record.get("colors"))
                        .sizes(record.get("sizes"))
                        .category(record.get("category"))
                        .imagePath(record.get("imagePath"))
                        .build();
            	
                // validate the product dto
                var violations = validator.validate(dto);
                if (!violations.isEmpty()) {
                    for (var v : violations) {
//                        errors.add(Map.of("row", row, "error", v.getMessage()));
                    	errors.put("For the record "+row, v.getMessage());
                    }
                    continue;
                }
                
                // check if category exists
                Optional<Category> category = categoryRepository.findByName(dto.getCategory());
                if (category.isEmpty()) {
//                    errors.add(Map.of("row", row, "error", "Category not found with name " + dto.getCategory()));
                	errors.put("For the record "+ row, "Category not found with name " + dto.getCategory());
                    continue;
                }
                
                validProducts.add(dto);
            	                
            }
            
            System.out.println("transfer to dto");
            
            if (errors.isEmpty()) {
            	System.out.println("no errors");
                
            	// save the valid products to the database
                List<Product> products = validProducts.stream()
                		.map(productDto ->{
                	
                			
                			byte[] imageData = null;
                			String imageName = null;
                			try {
								imageData = Files.readAllBytes(Paths.get(productDto.getImagePath()));
								imageName = Paths.get(productDto.getImagePath()).getFileName().toString();
							} catch (IOException e) {
//								e.printStackTrace();
								// handle the exception
								throw new RuntimeException("Failed to read image file "+e.getMessage());
							}
                			
                			Category category = categoryRepository.findByName(productDto.getCategory()).get();
                			return Product.builder()
                					.name(productDto.getName())
                					.description(productDto.getDescription())
                					.price(productDto.getPrice())
                					.brand(productDto.getBrand())
                					.stock(productDto.getStock())
                					.rating(0.0) // set 1 for default
                					.colors(productDto.getColors())
                					.sizes(productDto.getSizes())
                					
                					.imageData(imageData)
                					.imageName(imageName)
                					.category(category)
                					
                					.build();
                
                }).collect(Collectors.toList());
                
                productRepository.saveAll(products);
			} else {

				// return the errors
				Response response = new Response();
				response.setStatus(400);
				response.setMessage("Validation failed. Please check the values");
				response.setErrors(errors);
				return response;
			}
            
        }catch(Exception e){
//                        	e.printStackTrace();
            	Response response = new Response();
            	response.setStatus(400);
            	response.setMessage("Failed to parsing CSV file " + e.getMessage());
            	return response;
            }
             Response response = new Response();
             response.setStatus(200);
             response.setMessage("Products uploaded and added successfully");
             
             // add entry to activity logs
             ActivityLogs.addEntry("Multiple products added");	
           
             return response;
}

}
