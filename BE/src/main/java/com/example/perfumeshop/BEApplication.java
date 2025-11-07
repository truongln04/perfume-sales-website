package com.example.perfumeshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class BEApplication {
    public static void main(String[] args) {
        SpringApplication.run(BEApplication.class, args);
    }
}