package com.darla.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.darla.entity.Category;
import com.darla.entity.Product;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	Optional<Category> findByName(String category);

	@Query("SELECT COUNT(c) FROM Category c")
	int countCategories();

	@Query("SELECT c FROM Category c order by c.id desc limit 4")
	List<Category> findTop4Categories();

}
