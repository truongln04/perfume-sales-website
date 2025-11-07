package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
    @Query("SELECT b FROM Brand b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.country) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Brand> searchByNameOrCountry(String keyword);
}
