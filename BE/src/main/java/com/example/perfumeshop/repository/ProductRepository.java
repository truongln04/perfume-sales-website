package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByTenSanPhamContainingIgnoreCase(String keyword);
}
