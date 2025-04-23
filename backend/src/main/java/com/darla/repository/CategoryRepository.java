package com.darla.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
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

	@Query("select p.category from Product p group by p.category having count(p) > 5")
	List<Category> findTopFiveCategories(Pageable pageable);
	
	@Query("SELECT c FROM Product p JOIN p.category c GROUP BY c.id HAVING COUNT(p.id) > 5")
	List<Category> findCategoriesWithMoreThanFiveProducts();
	
	@Query(value = "SELECT * FROM categories c WHERE (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) > 5 limit 5", nativeQuery = true)
	List<Category> findCategoriesWithMoreThanFiveProductsNative();



}
