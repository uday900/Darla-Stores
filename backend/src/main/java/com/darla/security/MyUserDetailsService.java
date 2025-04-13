package com.darla.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.darla.entity.User;
import com.darla.repository.UserRepository;

@Service
public class MyUserDetailsService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		Optional<User> user = userRepository.findByEmail(username);
		if (user.isPresent()) {
			System.out.println("User found: " + user.get().getEmail());
			return new MyUserDetails(user.get());
		}
		throw new UsernameNotFoundException("User not found with username: " + username);
		
	}

}
