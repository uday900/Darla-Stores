package com.darla.service;

import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.darla.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	public String SECRET_KEY = "";

	public JwtService() throws NoSuchAlgorithmException {

		KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
		SecretKey sk = keyGen.generateKey();
		SECRET_KEY = Base64.getEncoder().encodeToString(sk.getEncoded());
	}

	// expiration in milliseconds
	public String generateToken(String username, Long expiration) {

		Map<String, Object> claims = new HashMap<>();
		return Jwts.builder()

				.claims().add(claims).subject(username).issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + expiration)) // setting 1 day as expiration
				.and().signWith(getKey())

				.compact();
	}

	private SecretKey getKey() {
		byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);

		return Keys.hmacShaKeyFor(keyBytes);
	}

	public String extractUserName(String token) {

		return extractClaim(token, Claims::getSubject);
	}

	private <T> T extractClaim(String token, Function<Claims, T> claimResover) {
		final Claims claims = extractAllClaims(token);
		return claimResover.apply(claims);

	}

	private Claims extractAllClaims(String token) {

		try {
			return Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();
		} catch (Exception e) {
			throw new RuntimeException("Invalid or expired token. Please log in again.");
		}
	}
public boolean isValidToken(UserDetails userDetails, String token) {
	final String username = extractUserName(token);
	
	return username.equals(userDetails.getUsername()) && !isTokenExpire(token);
	
}

	public boolean isValidToken(User user, String token) {
		final String username = extractUserName(token);

		return username.equals(user.getEmail()) && !isTokenExpire(token);

	}

	public boolean isTokenExpire(String token) {

		return extractExpiration(token).before(new Date());

	}

	private Date extractExpiration(String token) {
		// TODO Auto-generated method stub
		return extractClaim(token, Claims::getExpiration);
	}
}
