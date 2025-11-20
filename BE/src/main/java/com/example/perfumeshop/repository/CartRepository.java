package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByTaiKhoan_IdTaiKhoan(Integer idTaiKhoan);
    Cart findByTaiKhoan_IdTaiKhoanAndSanPham_IdSanPham(Integer idTaiKhoan, Integer idSanPham);
}
