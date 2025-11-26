package com.example.perfumeshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.perfumeshop.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByTenDanhMucContainingIgnoreCase(String keyword);

    boolean existsByTenDanhMucIgnoreCase(String tenDanhMuc);
}