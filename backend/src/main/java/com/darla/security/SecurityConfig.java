package com.darla.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
	@Autowired
	UserDetailsService userDetailsService;

	@Autowired
	private JwtFilter jwtFilter;
	@Autowired
	private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

	
//	@Autowired
//	private CustomOAuthUserService customOAuthUserService;
//	
	@Autowired
	private OAuthSuccessHandler oAuthSuccessHandler;
	
	@Value("${frontend.url}") 
	private String frontEndUrl;
	
	@Bean
	SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
		return httpSecurity
				.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
				
				
				.authorizeHttpRequests(request -> request
						
						.requestMatchers(
								"/auth/**",
								"/reviews/product/{productId:[\\d]+}"
								)
						.permitAll()
						.requestMatchers(HttpMethod.GET, "/category/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/products/**").permitAll()
//						.requestMatchers(HttpMethod.POST, "/category/upload-csv").permitAll()
//						.requestMatchers(HttpMethod.POST, "/products/upload-csv").permitAll()
						.anyRequest()
						.authenticated()
						)
				.oauth2Login(login -> login
						.successHandler(oAuthSuccessHandler)
						)
				.exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))

				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
				
				.httpBasic(Customizer.withDefaults())
				
				.build();
	}
	
	
	 @Bean
	  WebMvcConfigurer corsConfigurer() {
	        return new WebMvcConfigurer() {
	            @Override
	            public void addCorsMappings(CorsRegistry registry) {
	                registry
	                    .addMapping("/**")
	                    .allowedOrigins(frontEndUrl)
	                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
	                    .allowedHeaders("*")
	                    .allowCredentials(true);
	            }
	        };
	    }
	

	@Bean
	AuthenticationManager manager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}
	
	@Bean
	AuthenticationProvider provider() {
		DaoAuthenticationProvider authenticationProvider = 
				new DaoAuthenticationProvider();
		authenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder(12));
		authenticationProvider.setUserDetailsService(userDetailsService);
		
		return authenticationProvider;

	}
}
