package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByTenSanPhamContainingIgnoreCase(String keyword);
    List<Product> findByDanhMuc_IdDanhMuc(Integer idDanhMuc);

    // Hoặc nếu muốn phân trang
    Page<Product> findByDanhMuc_IdDanhMuc(Integer idDanhMuc, Pageable pageable);
}
