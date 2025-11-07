package com.example.perfumeshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Cho phép tất cả endpoint
                        .allowedOrigins("http://localhost:5173") // Cho phép frontend React
                        .allowedMethods("GET", "POST", "PUT", "DELETE") // Cho phép các method
                        .allowedHeaders("*");
            }
        };
    }
}
