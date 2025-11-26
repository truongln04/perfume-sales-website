package com.example.perfumeshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.perfumeshop.entity.Brand;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
    @Query("SELECT b FROM Brand b WHERE LOWER(b.tenthuonghieu) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.quocgia) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Brand> searchByNameOrCountry(String keyword);

    boolean existsByTenthuonghieuIgnoreCase(String tenThuongHieu);
}
