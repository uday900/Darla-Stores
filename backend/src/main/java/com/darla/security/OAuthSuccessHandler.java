package com.darla.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.darla.controller.AuthController;
import com.darla.dto.Response;
import com.darla.dto.UserDto;
import com.darla.entity.User;
import com.darla.repository.UserRepository;
import com.darla.service.JwtService;

import io.lettuce.core.dynamic.annotation.Value;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler
{

	@Autowired
	private UserRepository userRepository;
	
	@Autowired 
	private JwtService jwtService;
	
	@org.springframework.beans.factory.annotation.Value("${frontend.url}")
	private String frontendUrl;
	
//	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request, 
			HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		
		String mode = AuthController.oAuthMode;
		OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
		String email = oauthUser.getAttribute("email");
		
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (mode.equals("login")) {
			if (userOpt.isPresent()) {
				User user = userOpt.get();
				Long exp = 24 * 60 * 60 * 1000L; // 24 hours
				String token = jwtService.generateToken(email, exp);
//				UserDto userDto = UserDto.builder().id(user.getId()).name(user.getName()).email(user.getEmail())
//						.role(user.getRole()).city(user.getCity()).state(user.getState()).country(user.getCountry())
//						.district(user.getDistrict()).street(user.getStreet()).createdAt(user.getCreatedAt())
//						.phoneNumber(user.getPhoneNumber()).build();
//				Response res = new Response();
//				res.setStatus(200);
//				res.setMessage("Login successful");
//				res.setToken(token);
//				res.setUser(userDto);
				
				
				response.sendRedirect(frontendUrl + "/login?success=Logged in successfull&token=" + token);
				
				// send redirect to client with details
				
			} else {
				// send redirect url to return error with user Account not found
				response.sendRedirect(frontendUrl + "/login?error=Account not found");
			}
			
		} else {
			if (userOpt.isEmpty()) {
				User user = new User();	
				user.setName(oauthUser.getAttribute("name"));
				user.setEmail(email);
				user.setRole("USER");
				user.setCreatedAt(LocalDateTime.now());
				userRepository.save(user);
				Response res = new Response();
				res.setStatus(201);
				res.setMessage("Registration successful");
				
				// send redirect to client with success message
				response.sendRedirect(frontendUrl + "/register?success=Registration successful");
				
			} else {
				// send redirect url to return error with user Account already exists
				response.sendRedirect(frontendUrl + "/register?error=Account already exists");
			}
		}
		
		
 
	}

}
