package com.darla.controller;

import com.darla.dto.ReviewDto;
import com.darla.service.ReviewService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Add a new review
    @PostMapping
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> addReview(@Valid @RequestBody ReviewDto reviewDto) {
        reviewService.addReview(reviewDto);
        return ResponseEntity.ok("Review added successfully!");
    }

    // Get all reviews for a specific product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    // Get a specific review by its ID
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDto> getReviewById(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    // Update a review
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> updateReview(
    		@PathVariable Long reviewId,
    		@RequestParam Double rating,
    		@RequestParam String comment
    		) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId,rating,  comment ));
    }

    // Delete a review
    @DeleteMapping("/{reviewId}/user/{userId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId, @PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.deleteReview(reviewId, userId));
    }
}
