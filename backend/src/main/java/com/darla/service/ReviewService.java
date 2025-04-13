package com.darla.service;

import org.springframework.stereotype.Service;
import com.darla.dto.ReviewDto;
import com.darla.entity.Product;
import com.darla.entity.Review;
import com.darla.entity.User;
import com.darla.exception_handling.NotFoundException;
import com.darla.repository.*;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private ReviewRepository reviewRepository;
    private ProductRepository productRepository;
    private UserRepository userRepository;

    // Constructor to initialize repositories
    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Method to add a review
    public void addReview(ReviewDto reviewDto) {
        // Check if the product exists
        Product product = productRepository.findById(reviewDto.getProductId()).orElseThrow(
                () -> new NotFoundException("Product not found with id: " + reviewDto.getProductId()));
        
        // Check if the user exists
        User user = userRepository.findById(reviewDto.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found with id: " + reviewDto.getUserId()));
        
        // Create and save the review
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        reviewRepository.save(review);
        
        // Update the product rating after adding the review
        updateProductRating(product);
    }

    // Method to get all reviews for a product
    public List<ReviewDto> getReviewsByProduct(Long productId) {
        // Check if the product exists
        productRepository.findById(productId).orElseThrow(
                () -> new NotFoundException("Product not found with id: " + productId));
        
        // Fetch reviews and map them to DTOs
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream().map(review -> {
            ReviewDto reviewDto = new ReviewDto();
            reviewDto.setId(review.getId());
            reviewDto.setProductId(productId);
            reviewDto.setUserId(review.getUser().getId());
            reviewDto.setUserName(review.getUser().getName());
            reviewDto.setRating(review.getRating());
            reviewDto.setComment(review.getComment());
            reviewDto.setCreatedAt(review.getCreatedAt());
            return reviewDto;
        }).collect(Collectors.toList());
    }

    // Method to get a single review by ID
    public ReviewDto getReviewById(Long id) {
        Review review = reviewRepository.findById(id).orElseThrow(() -> new NotFoundException("Review not found with id: " + id));
        ReviewDto reviewDto = new ReviewDto();
        reviewDto.setId(review.getId());
        reviewDto.setProductId(review.getProduct().getId());
        reviewDto.setComment(review.getComment());
        reviewDto.setCreatedAt(review.getCreatedAt());
        reviewDto.setUserName(review.getUser().getName());
        reviewDto.setUserId(review.getUser().getId());
        return reviewDto;
    }

    // Method to delete a review
    @Transactional
    public String deleteReview(Long id, Long userId) {
        // Check if the user exists
        userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        
        // Check if the review exists
        Review review = reviewRepository.findById(id).orElseThrow(() -> new NotFoundException("Review not found with id: " + id));
        
        // Check if the product exists
        Product product = productRepository.findById(review.getProduct().getId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + review.getProduct().getId()));
        
        // Delete the review
        reviewRepository.deleteById(id);
        
        // Update product rating after deleting the review
        updateProductRating(product);
        
        return "Review deleted successfully!";
    }

    // Method to update a review
    @Transactional
    public String updateReview(Long reviewId, Double rating, String comment) {
        // Check if the review exists
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found with id: " + reviewId));
        
        // Update review fields
        review.setRating(rating);
        review.setComment(comment);
        reviewRepository.save(review);
        
        // Update product rating after updating the review
        updateProductRating(review.getProduct());
        
        return "Review updated successfully!";
    }

    // Method to update the average rating of a product
    private void updateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        if (reviews.isEmpty()) {
            product.setRating(0.0);
        } else {
            Double avgRating = reviews.stream().mapToDouble(Review::getRating).average().orElse(0.0);
            avgRating = Math.round(avgRating * 10.0) / 10.0; // Round to 1 decimal place
            
            product.setRating(avgRating);
           
        }
        productRepository.save(product);
    }
}
