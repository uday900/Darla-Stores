package com.darla;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DarlaStoresApplication {
	public static void main(String[] args) {
		SpringApplication.run(DarlaStoresApplication.class, args);
		System.out.println("Darla Stores Application is running! darlastores.com/v2.1");
	}
}
