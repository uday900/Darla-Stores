package com.darla.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private Integer quantity;
     
    private Double totalAmount;
    
    private String status; // PENDING, CONFIRMED, SHIPPED, OUT_OF_DELIVERY, DELIVERED, CANCELED, REFUND_ISSUED
    
    private String razorpayOrderId;
    
    private String paymentId;
    
    private String paymentMethod; // RAZORPAY, CASH_ON_DELIVERY
    
    private String paymentStatus; // PENDING, COMPLETED, FAILED, REFUND_INITIATED, REFUNDED, CANCELED
    
    private String shippingAddress;

    private LocalDateTime createdAt = LocalDateTime.now();

}
