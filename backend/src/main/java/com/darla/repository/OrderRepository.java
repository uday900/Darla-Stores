package com.darla.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.darla.dto.OrderDto;
import com.darla.entity.Order;
import com.darla.entity.User;

public interface OrderRepository extends JpaRepository<Order, Long> {

	@Query("select o from Order o where o.user.id =:userId")
	List<Order> findByUserId(@Param("userId") Long userId);

	@Query("select count(o) from Order o")
	int countOrders();

	
	@Query("select o from Order o where o.user.createdAt > :sevenDaysAgo")
	List<Order> findRecentOrders(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

	@Query("select o from Order o where o.razorpayOrderId =:razorpay_order_id")
	List<Order> findByRazorpayOrderId(@Param("razorpay_order_id") String razorpay_order_id);
}
