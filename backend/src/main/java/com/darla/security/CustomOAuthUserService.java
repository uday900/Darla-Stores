package com.darla.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.darla.entity.User;
import com.darla.repository.UserRepository;

@Service
public class CustomOAuthUserService// extends DefaultOAuth2UserService
{
	
	@Autowired
	private UserRepository userRepository;
	
//	public OAuth2User 
//	loadUser(OAuth2UserRequest auth2UserRequest) {
//		
//		OAuth2User userOauth = super.loadUser(auth2UserRequest);
//		String username = userOauth.getAttribute("email");
//		if (username == null) throw new OAuth2AuthenticationException("Email not found in Authentication provider ");
//	
//
//		 
//		 return userOauth;

//	}

}
