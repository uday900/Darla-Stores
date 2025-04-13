package com.darla.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.darla.entity.Carousel;

public interface CarouselRepository extends JpaRepository<Carousel, Long>{

	@Query("select count(c) from Carousel c")
	int countCarousels();

}
