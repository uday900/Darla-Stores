package com.darla.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.darla.dto.ProductDto;
import com.darla.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

	@Query("select p from Product p where p.category.name = :categoryName")
	List<Product> findByCategoryName(String categoryName);

	@Query("SELECT p FROM Product p WHERE "
		       + "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR "
		       + "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR "
		       + "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR "
		       + "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%'))")
	List<Product> findBySearchQuery(String query);

	@Query("select count(p) from Product p")
	int countProducts();

	@Query("select p  from Product p order by p.createdAt desc limit 10")
	List<Product> findTopTenProducts();



}
