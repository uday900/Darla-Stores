package com.darla.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.darla.dto.RegisterDto;
import com.darla.dto.Response;
import com.darla.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {
	public static String oAuthMode = "login";
	
	@Autowired
	private UserService userService;
	

	// login with oauth
	@GetMapping("/oauth/login")
	public void redirectToGoogleOAuth(@RequestParam String mode, HttpServletRequest request, HttpServletResponse response) throws IOException {
		oAuthMode = mode.equalsIgnoreCase("login") ? "login" : "register";
		
//	    request.getSession().setAttribute("mode", mode); // Save mode in session
	    response.sendRedirect("/oauth2/authorization/google"); // Proceed with default Spring redirect
	}

	
    // verify JWT token
	@PostMapping("/verify-token")
	public ResponseEntity<Response> verifyJwtToken(@RequestParam String token){
		Response res = userService.verifyJwtToken(token);
		return ResponseEntity.status(res.getStatus()).body(res);
	}
	
	@PostMapping("/verify-otp-and-set-password")
	public ResponseEntity<Response> verifyOtpAndSetNewPassword(
			@RequestParam String email, 
			@RequestParam String otp,
			@RequestParam String password) {
		Response res = userService.verifyOtpAndSetNewPassword(email, otp, password);
		
		return ResponseEntity.status(res.getStatus()).body(res);
	}
	
	@PostMapping("/send-otp-to-email")
	public ResponseEntity<Response> sendOtpToEmail(@RequestParam String email) {
		String res = userService.sendOtpToEmail(email);
		Response response = new Response();
		response.setMessage(res);
		
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}
	
	//  login user
	@PostMapping("/login")
	public ResponseEntity<Response> login(
			@RequestParam String username,
			@RequestParam String password
			){
		Response res = userService.login(username, password);
		
		// return jwt token here and user info
		return ResponseEntity.status(res.getStatus()).body(res);		
	}
	// register user
	@PostMapping("/register")
	public ResponseEntity<Response> registerUser(
			@Valid @RequestBody RegisterDto registerDto) {
		Response res = new Response();
		String message = userService.registerUser(registerDto);
		res.setMessage(message);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(res);
	}
	
	
}
