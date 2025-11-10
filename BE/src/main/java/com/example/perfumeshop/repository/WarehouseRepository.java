package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
    
    @Query("SELECT w FROM Warehouse w WHERE LOWER(w.sanPham.tenSanPham) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Warehouse> searchByTenSanPham(@Param("keyword") String keyword);

    List<Warehouse> findByTonHienTaiGreaterThan(Integer minTon);

    List<Warehouse> findByTonHienTaiLessThan(Integer maxTon);

    List<Warehouse> findByTonHienTaiBetween(Integer min, Integer max);
}
