package com.darla.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.darla.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

	@Query("select c from Cart c where c.user.id =:userId and c.product.id = :productId")
	Optional<Cart> findProductByUserId(@Param("userId") Long userId,@Param("productId") Long productId);

	@Query("select c from Cart c where c.user.id =:userId")
	List<Cart> findByUser(@Param("userId") Long userId);

}
