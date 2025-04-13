package com.darla.service;

import java.time.Duration;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OtpService {
	@Autowired
	private StringRedisTemplate redisTemplate;
	
	public void storeOtpInRedis(String email, String otp) {
		// Store the OTP in Redis with a TTL of 5 minutes
        redisTemplate.opsForValue().set(email, otp, Duration.ofMinutes(5));
        System.out.println("OTP stored in Redis for email: " + email);
	}
	
	public boolean isOtpValid(String email,String otp) {
		String storedOtp = redisTemplate.opsForValue().get(email);
		return storedOtp != null && storedOtp.equals(otp);
	}
	
	// Generate a 6-digit OTP
	public String generateOtp() {
		Random random = new Random();
		int val = 100000 + random.nextInt(900000);
		return String.valueOf(val);
	}
	
	
}
