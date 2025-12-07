package com.example.perfumeshop.repository;

import com.example.perfumeshop.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    // Mỗi tài khoản chỉ có một giỏ hàng
    Cart findByTaiKhoan_IdTaiKhoan(Integer idTaiKhoan);
}