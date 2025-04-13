package com.darla.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.darla.entity.User;
import com.darla.repository.UserRepository;

@Component
public class DefaultAdminSetup implements CommandLineRunner {

	@Autowired
	private UserRepository repository;
	private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);
	@Override
	public void run(String... args) throws Exception {
		// TODO Auto-generated method stub
		String adminEmail = "admin@darla.com";
		// Check if the admin user already exists
		// If not, create a new admin user
		// with default credentials
		// and save it to the database
		Optional<User> adminOpt = repository.findByEmail(adminEmail);

        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(bCryptPasswordEncoder.encode("admin123")); // Encrypted password
            admin.setRole("ADMIN");

            repository.save(admin);
            System.out.println("Default admin created: " + adminEmail);
        }

	}

}
