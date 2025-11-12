package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Product;
import com.example.perfumeshop.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
    Warehouse findBySanPham(Product sanPham);
    @Query("SELECT w FROM Warehouse w WHERE LOWER(w.sanPham.tenSanPham) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Warehouse> searchByTenSanPham(String keyword);
}
