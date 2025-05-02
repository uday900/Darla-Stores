package com.darla.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import io.lettuce.core.RedisURI;

import org.springframework.data.redis.connection.*;

@Configuration
@EnableCaching
public class RedisConfig {
	// Configuration for Redis caching can be added here
	// For example, you can define a RedisTemplate bean if needed
	// or configure other Redis-related settings.
	
	@Value("${spring.redis.host}")
	private String redisHost;
	
	@Value("${spring.redis.port}")
	private int redisPort;
	@Value("${spring.redis.password}")
	private String redisPassword;
	@Value("${spring.redis.ssl.enabled:true}")
	private boolean sslEnabled;

	@Bean
	public RedisConnectionFactory redisConnectionFactory() {
		RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
		redisConfig.setHostName(redisHost);
		redisConfig.setPort(redisPort);
		redisConfig.setPassword(redisPassword);
		
		LettuceConnectionFactory lettuceConnectionFactor = new LettuceConnectionFactory(redisConfig);
		lettuceConnectionFactor.setUseSsl(sslEnabled);
        return lettuceConnectionFactor;
        
	}
}
