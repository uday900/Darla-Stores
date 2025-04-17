package com.darla.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.darla.dto.ProductDto;
import com.darla.dto.ProductsDto;
import com.darla.dto.Response;
import com.darla.entity.Carousel;
import com.darla.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/products")
@Validated
public class ProductController {
	
	private final ProductService productService;

	public ProductController(
			ProductService productService
			){
		this.productService = productService;
	}
	
	// fetch metrics, only for admin
	@GetMapping("/metrics")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> fetchMetrics() {
		
		Map<String, Object> map = productService.fetchMetrics();
		Response response = new Response();
		response.setMetrics(map);
		

		return ResponseEntity.ok(response);
	}
	
	
	// fetch all products, only for admin
	@GetMapping
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> fetchAllProducts() {
		Response response = new Response();
		List<ProductDto> products = productService.fetchAllProducts();
		response.setProducts(products);
		
		return ResponseEntity.ok(response);
	}
	
	// fetch product by id
	@GetMapping("/{id}")
	public ResponseEntity<Response> fetchProductById(@PathVariable Long id) {
		Response response = new Response();
		if (id == null) {
			response.setMessage("Id cannot be null");
			return ResponseEntity
					.status(HttpStatus.BAD_REQUEST)
					.body(response);
		}
		ProductDto product = productService.fetchProductById(id);
		
		response.setProduct(product);
		return ResponseEntity.ok(response);
		
	}
	
	// add product
	@PostMapping
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> addProduct(@Valid @ModelAttribute ProductDto productDto
			) throws IOException {
		Response response = new Response();
		String message = productService.addProduct(productDto);
		response.setMessage(message);
		return ResponseEntity.ok(response);
	}
	
	// add multiple products 
//	@PostMapping("/add-multiple")
//	@PreAuthorize("hasRole('ROLE_ADMIN')")
//	public ResponseEntity<Response> addMultipleProducts(
//			
//			@RequestBody List<@Valid ProductsDto> productsDto) throws IOException {
//			
//		Response response = new Response();
//		String res = productService.addMultipleProducts(productsDto);
//		
//		response.setMessage(res);
//		return ResponseEntity.ok(response);
//	}
	
	// upload products through csv file
	@PostMapping("/upload-csv")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> uploadProducts(@RequestParam("file") MultipartFile file) {
		Response response = productService.uploadProducts(file);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	// fetch show case products
	@GetMapping("/showcase")
	public ResponseEntity<Map<String, List<ProductDto>>> fetchShowcaseProducts() {
		Map<String, List<ProductDto>> showcaseProducts = productService.fetchShowcaseProducts();
		return ResponseEntity.ok(showcaseProducts);
	}
	
	
	// fetch all products by category	
	@GetMapping("/category")
	public ResponseEntity<Response> fetchProductsByCategory(@RequestParam String category) {
		Response response = new Response();
		System.out.println("category: " + category);
		List<ProductDto> products = productService.fetchProductsByCategory(category);
		response.setProducts(products);
		return ResponseEntity.ok(response);
	}
	
	// fetch all products by search query
	@GetMapping("/search")
	public ResponseEntity<Response> fetchProductsBySearch(@RequestParam String query) {
		Response response = new Response();
		List<ProductDto> products = productService.fetchProductsBySearch(query);
		response.setProducts(products);
		return ResponseEntity.ok(response);
	}
	
	// update product
	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> updateProduct(
//			@Valid @ModelAttribute ProductDto productDto,
			@PathVariable Long id,
			@RequestParam(required = false) String name,
	        @RequestParam(required = false) String description,
	        @RequestParam(required = false) Double price,
	        @RequestParam(required = false) Integer stock,
	        @RequestParam(required = false) Integer rating,
	        @RequestParam(required = false) String brand,
	        @RequestParam(required = false) String colors,
	        @RequestParam(required = false) String sizes,
	        @RequestParam(required = false) String category,
	        @RequestParam(required = false) MultipartFile imageFile
			) {
		Response response = new Response();
		if (
				name == null && description == null && price == null 
		        && stock == null && rating == null 
		        && brand == null && colors == null 
		        && sizes == null && category == null 
		        && (imageFile == null || imageFile.isEmpty())) {
			response.setMessage("Product id is required or atleast one value should be updated");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
		String message = productService.updateProduct( id,name, description,price, stock, brand, colors, sizes,
				category, imageFile);
		response.setMessage(message);
		return ResponseEntity.ok(response);
	}
	
	// delete product
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Response> deleteProduct(@PathVariable Long id) {
		Response response = new Response();
		
		String message = productService.deleteProduct(id);
		response.setMessage(message);
		return ResponseEntity.ok(response);
	}
	
	/*
	 * carousel mappings
	 */
	
	@GetMapping("/carousels")
    public ResponseEntity<List<Carousel>> fetchAllImages() {
        List<Carousel> images = productService.fetchAllCarouselImages();
        return ResponseEntity.ok(images);
    }

    // Add a new carousel image
    @PostMapping("/carousels/add")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Response> addNewImage(@RequestParam MultipartFile image) {
    	Response response = new Response();
        try {
            String message = productService.addNewCarouselImage(image);
            response.setMessage(message);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
        	response.setMessage("Error uploading image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Remove a carousel image
    @DeleteMapping("/carousels/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Response> removeImage(@PathVariable Long id) {
        String response = productService.removeCarouselImage(id);
        Response res = new Response();
        res.setMessage(response);
        return ResponseEntity.ok(res);
    }
	
}
